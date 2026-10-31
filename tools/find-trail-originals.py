#!/usr/bin/env python3
"""Find the originals of the Israel Trail photos in the macOS Photos library.

    python3 tools/find-trail-originals.py [--section 41 ...] [--reference DIR ...] [--export]
    python3 tools/find-trail-originals.py --routes-only    # hike times only, no library needed

Run it from a terminal that has Full Disk Access (System Settings > Privacy & Security).
The library is only read: its database is copied to a temporary folder first.

Hike days come from the routes of an Apple Health export: a day is recorded when that day's
routes follow most of a section's track, which gives the exact start and end times. Without
a route, a day is likely when its geotagged photos spread along the track. Both also cover
sections with no post yet. A day that has a published photo of the section's post, matched
by capture time, is confirmed. Photos with no GPS (or a spoofed one) are added from the
hike's time window, and every photo gets its position on the route at the time it was taken.

Writes hikes.csv, manifest.csv and, with --export, copies the originals to <out>/section-NN/.
Originals that iCloud keeps only in the cloud are listed but can't be copied.
"""
import argparse
import bisect
import csv
import json
import math
import re
import shutil
import sqlite3
import subprocess
import sys
import tempfile
import zipfile
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

REPO = Path(__file__).resolve().parent.parent
LIBRARY = Path.home() / "Pictures/Photos Library.photoslibrary"
ISRAEL = ZoneInfo("Asia/Jerusalem")
APPLE_EPOCH = 978307200  # Photos stores seconds since 2001-01-01
SAME_TIME_SECONDS = 2
WINDOW_MARGIN = timedelta(minutes=30)
MIN_TRACK_COVERAGE = 0.25
MIN_ROUTE_COVERAGE = 0.5  # of the section's track, by all the routes of a day
MIN_ROUTE_PART = 0.05  # a route that covers less of the track isn't part of the hike
ROUTE_CELL = 0.002  # degrees, about 200 m
ROUTE_POINT_STEP = 5  # routes have a point per second
ROUTE_MARGIN = 0.1  # degrees around the track; route points beyond it are GPS spoofing
MAX_ROUTE_GAP = 120  # seconds between a photo and the route point it's placed at
CAMP_DISTANCE = 500  # meters between one day's end and the next day's start of an overnight hike
TRKPT = re.compile(rb'<trkpt lon="([-\d.]+)" lat="([-\d.]+)">.*?<time>([^<]+)</time>')


def map_id(section):
    section = str(section).strip().strip("'\"")
    return f"0{section}" if re.fullmatch(r"\d", section) else section


def load_tracks(sections=None):
    """{ section: [((lon, lat), (lon, lat)), ...] } of the track's segments"""
    tracks = {}
    for file in sorted((REPO / "public/topojson").glob("trail-*.topojson")):
        section = file.stem.removeprefix("trail-")
        if sections and section not in sections:
            continue
        topology = json.loads(file.read_text())
        transform = topology.get("transform")
        segments = []
        for arc in topology["arcs"]:
            points, x, y = [], 0, 0
            for dx, dy, *_ in arc:
                if transform:
                    x, y = x + dx, y + dy
                    points.append((x * transform["scale"][0] + transform["translate"][0],
                                   y * transform["scale"][1] + transform["translate"][1]))
                else:
                    points.append((dx, dy))
            segments += zip(points, points[1:])
        tracks[section] = segments
    return tracks


def bounds(points):
    lons, lats = zip(*points)
    return min(lons), min(lats), max(lons), max(lats)


def diagonal_meters(points):
    west, south, east, north = bounds(points)
    return math.hypot((east - west) * 111320 * math.cos(math.radians((south + north) / 2)),
                      (north - south) * 110540)


def distance_from_track(lon, lat, segments):
    kx, ky = 111320 * math.cos(math.radians(lat)), 110540
    best = math.inf
    for (lon1, lat1), (lon2, lat2) in segments:
        ax, ay = (lon1 - lon) * kx, (lat1 - lat) * ky
        bx, by = (lon2 - lon) * kx, (lat2 - lat) * ky
        dx, dy = bx - ax, by - ay
        length = dx * dx + dy * dy
        u = max(0, min(1, -(ax * dx + ay * dy) / length)) if length else 0
        best = min(best, math.hypot(ax + u * dx, ay + u * dy))
    return best


def read_routes(source):
    """Yield (name, gpx bytes) out of an Apple Health export, zipped or not"""
    if source.is_dir():
        for file in sorted(source.rglob("*.gpx")):
            yield file.name, file.read_bytes()
        return
    with zipfile.ZipFile(source) as archive:
        for name in sorted(n for n in archive.namelist() if n.endswith(".gpx")):
            yield Path(name).name, archive.read(name)


def route_cells(points):
    return {(int(lon / ROUTE_CELL), int(lat / ROUTE_CELL)) for lon, lat, _ in points}


def covered_vertices(vertices, cells):
    return {(lon, lat) for lon, lat in vertices
            if any((int(lon / ROUTE_CELL) + dx, int(lat / ROUTE_CELL) + dy) in cells
                   for dx in (-1, 0, 1) for dy in (-1, 0, 1))}


def find_hikes(source, tracks):
    """{ section: { date: { start, end, coverage, files, points } } } out of the recorded routes"""
    sections = {}
    for section, segments in tracks.items():
        vertices = {point for segment in segments for point in segment}
        sections[section] = (vertices, bounds(vertices))

    parts = defaultdict(lambda: defaultdict(list))
    for name, gpx in read_routes(source):
        points = [(float(lon), float(lat), datetime.fromisoformat(time.decode().replace("Z", "+00:00")).timestamp())
                  for lon, lat, time in TRKPT.findall(gpx)[::ROUTE_POINT_STEP]]
        if not points:
            continue
        cells = None
        for section, (vertices, (west, south, east, north)) in sections.items():
            near = [p for p in points if west - ROUTE_MARGIN <= p[0] <= east + ROUTE_MARGIN
                    and south - ROUTE_MARGIN <= p[1] <= north + ROUTE_MARGIN]
            if not near:
                continue
            cells = route_cells(near)
            covered = covered_vertices(vertices, cells)
            if len(covered) >= MIN_ROUTE_PART * len(vertices):
                date = datetime.fromtimestamp(points[0][2], ISRAEL).date()
                parts[section][date].append((name, near, covered))

    hikes = defaultdict(dict)
    for section, days in parts.items():
        vertices = sections[section][0]
        for date, routes in days.items():
            covered = set().union(*(route[2] for route in routes))
            coverage = len(covered) / len(vertices)
            if coverage < MIN_ROUTE_COVERAGE:
                continue
            points = sorted((p for route in routes for p in route[1]), key=lambda p: p[2])
            hikes[section][date] = {
                "start": datetime.fromtimestamp(points[0][2], ISRAEL),
                "end": datetime.fromtimestamp(points[-1][2], ISRAEL),
                "coverage": coverage,
                "files": [route[0] for route in routes],
                "points": points,
                "times": [p[2] for p in points],
            }
    link_overnight_hikes(hikes)
    return hikes


def link_overnight_hikes(hikes):
    """The night between two days of a hike is part of both: photos at the camp are part of the story"""
    days = [hike for section in hikes.values() for hike in section.values()]
    for hike in days:
        hike.setdefault("window_start", hike["start"] - WINDOW_MARGIN)
        hike.setdefault("window_end", hike["end"] + WINDOW_MARGIN)
    for first in days:
        for second in days:
            night = second["start"] - first["end"]
            ends = [first["points"][-1][:2], second["points"][0][:2]]
            if timedelta(0) < night < timedelta(hours=24) and diagonal_meters(ends) <= CAMP_DISTANCE:
                first["window_end"] = second["start"]
                second["window_start"] = first["end"]


def route_position(hike, taken):
    """(lat, lon) of the route when a photo was taken, or (None, None) if it wasn't recording"""
    second = taken.timestamp()
    index = bisect.bisect_left(hike["times"], second)
    candidates = hike["points"][max(index - 1, 0):index + 1]
    nearest = min(candidates, key=lambda p: abs(p[2] - second))
    if abs(nearest[2] - second) > MAX_ROUTE_GAP:
        return None, None
    return round(nearest[1], 6), round(nearest[0], 6)


def report_hikes(hikes, tracks, posts, reference_dirs, out):
    """Print and save the recorded hikes, checked against the capture times of the published photos"""
    times = capture_times([REPO / image for post in posts for image in post["images"]])
    for taken_source, taken in reference_times(reference_dirs).items():
        for post in posts:
            for image in post["images"]:
                if Path(image).name == taken_source:
                    times.setdefault(str(REPO / image), taken)

    columns = ["section", "date", "start", "end", "coverage", "published_in_window", "published_with_time", "files"]
    with open(out / "hikes.csv", "w", newline="", encoding="utf-8-sig") as file:
        writer = csv.DictWriter(file, columns)
        writer.writeheader()
        print("section  date        start  end    track  published-in-window  routes")
        for section in sorted(tracks):
            if section not in hikes:
                print(f"{section:<8} no recorded route")
            images = [image for post in posts if section in post["sections"] for image in post["images"]]
            dated = [times[str(REPO / image)] for image in images if str(REPO / image) in times]
            for date, hike in sorted(hikes.get(section, {}).items()):
                inside = sum(hike["window_start"] <= taken <= hike["window_end"] for taken in dated)
                writer.writerow({
                    "section": section, "date": date, "start": f"{hike['start']:%H:%M:%S}", "end": f"{hike['end']:%H:%M:%S}",
                    "coverage": f"{hike['coverage']:.0%}", "published_in_window": inside,
                    "published_with_time": len(dated), "files": " ".join(hike["files"]),
                })
                print(f"{section:<8} {date}  {hike['start']:%H:%M}  {hike['end']:%H:%M}  {hike['coverage']:>5.0%}  "
                      f"{f'{inside}/{len(dated)}':>19}  {' '.join(hike['files'])}")
    print()


def load_assets(library):
    database = library / "database/Photos.sqlite"
    with tempfile.TemporaryDirectory() as tmp:
        try:
            shutil.copy2(database, tmp)
            # Recent changes may still be in the write-ahead log
            for suffix in ("-wal", "-shm"):
                source = database.with_name(database.name + suffix)
                if source.exists():
                    shutil.copy2(source, tmp)
        except PermissionError:
            sys.exit(f"No access to {library}\nGive this terminal app Full Disk Access in "
                     "System Settings > Privacy & Security, then restart it.")
        except FileNotFoundError:
            sys.exit(f"No Photos database at {database}")
        connection = sqlite3.connect(Path(tmp) / "Photos.sqlite")
        connection.row_factory = sqlite3.Row
        rows = connection.execute("""
            SELECT a.ZUUID uuid, a.ZDATECREATED created, a.ZLATITUDE lat, a.ZLONGITUDE lon,
                   a.ZFILENAME filename, a.ZDIRECTORY directory, attrs.ZORIGINALFILENAME original_name
            FROM ZASSET a LEFT JOIN ZADDITIONALASSETATTRIBUTES attrs ON attrs.ZASSET = a.Z_PK
            WHERE a.ZKIND = 0 AND a.ZTRASHEDSTATE = 0 AND a.ZDATECREATED IS NOT NULL
        """).fetchall()
        connection.close()

    assets = []
    for row in rows:
        has_gps = row["lat"] not in (None, -180, 0) and row["lon"] not in (None, -180, 0)
        path = library / "originals" / (row["directory"] or "") / (row["filename"] or "")
        assets.append({
            "uuid": row["uuid"],
            "taken": datetime.fromtimestamp(row["created"] + APPLE_EPOCH, ISRAEL),
            "lat": row["lat"] if has_gps else None,
            "lon": row["lon"] if has_gps else None,
            "name": row["original_name"] or row["filename"],
            "path": path,
            "local": path.is_file(),
        })
    return assets


def capture_times(paths):
    """{ path: datetime } for the files that have a capture time"""
    if not paths:
        return {}
    args = ["exiftool", "-q", "-m", "-j", "-DateTimeOriginal", *map(str, paths)]
    output = subprocess.run(args, capture_output=True, text=True).stdout
    times = {}
    for item in json.loads(output or "[]"):
        try:
            taken = datetime.strptime(str(item.get("DateTimeOriginal")), "%Y:%m:%d %H:%M:%S")
        except ValueError:
            continue
        times[item["SourceFile"]] = taken.replace(tzinfo=ISRAEL)
    return times


def reference_times(reference_dirs):
    """{ file name: datetime } of copies that kept their metadata"""
    references = {}
    for directory in reference_dirs:
        files = [f for f in Path(directory).expanduser().iterdir() if f.is_file()]
        for source, taken in capture_times(files).items():
            references[Path(source).name] = taken
    return references


def load_posts():
    """[{ sections, images: [repo-relative path] }] of the trail posts"""
    posts = []
    for file in sorted((REPO / "src/posts").rglob("*.md")):
        text = file.read_text()
        parts = re.match(r"\s*---\r?\n(.*?)\r?\n---\s*\r?\n(.*)", text, re.S)
        if not parts:
            continue
        found = (re.search(r"^trailMaps:\s*\[(.*)\]", parts[1], re.M)
                 or re.search(r"^trailSerial:\s*\[(.*)\]", parts[1], re.M))
        if not found:
            continue
        images = dict.fromkeys(re.findall(r"!\[[^\]]*\]\(/?(img/[^\s)]+)", parts[2]))
        posts.append({"sections": [map_id(s) for s in found[1].split(",")], "images": list(images)})
    return posts


def match_published(posts, assets, reference_dirs):
    """Link published images to assets by capture time. Returns { uuid: image }, [unmatched], { section: dates }"""
    by_second = defaultdict(list)
    for asset in assets:
        by_second[int(asset["taken"].timestamp())].append(asset)

    images = [image for post in posts for image in post["images"]]
    times = capture_times([REPO / image for image in images])
    references = reference_times(reference_dirs)

    published, unmatched, dates = {}, [], defaultdict(set)
    for post in posts:
        for image in post["images"]:
            taken = times.get(str(REPO / image)) or references.get(Path(image).name)
            hits = []
            if taken:
                # The closest time wins: burst shots are a second apart, and their GPS can differ
                second = int(taken.timestamp())
                for offset in sorted(range(-SAME_TIME_SECONDS, SAME_TIME_SECONDS + 1), key=abs):
                    hits = by_second.get(second + offset, [])
                    if hits:
                        break
            for asset in hits:
                published[asset["uuid"]] = image
            if hits:
                dates_of_hits = {asset["taken"].date() for asset in hits}
                for section in post["sections"]:
                    dates[section] |= dates_of_hits
            else:
                unmatched.append((image, "no match in library" if taken else "image has no capture time"))
    return published, unmatched, dates


def find_hike_days(tracks, assets, radius, min_photos, confirmed, hikes):
    """{ section: { date: { near, coverage, status, hike } } }"""
    located = [asset for asset in assets if asset["lat"] is not None]
    days = {}
    for section, segments in tracks.items():
        track_points = [point for segment in segments for point in segment]
        west, south, east, north = bounds(track_points)
        margin = radius / 90000
        by_date = defaultdict(list)
        for asset in located:
            if (west - margin <= asset["lon"] <= east + margin and south - margin <= asset["lat"] <= north + margin
                    and distance_from_track(asset["lon"], asset["lat"], segments) <= radius):
                by_date[asset["taken"].date()].append(asset)

        length = diagonal_meters(track_points)
        days[section] = {}
        recorded = hikes.get(section, {})
        for date in {*by_date, *recorded, *confirmed.get(section, ())}:
            near = by_date.get(date, [])
            spread = diagonal_meters([(asset["lon"], asset["lat"]) for asset in near]) if near else 0
            coverage = spread / length if length else 0
            if date in confirmed.get(section, ()):
                status = "confirmed"
            elif date in recorded:
                status = "recorded"
            elif len(near) >= min_photos and coverage >= MIN_TRACK_COVERAGE:
                status = "likely"
            else:
                status = "passing"
            # A recording settles the hike's day: others are older walks here, or published photos from another day
            if date in recorded or not recorded:
                days[section][date] = {"near": near, "coverage": coverage, "status": status, "hike": recorded.get(date)}
    return days


def day_photos(day, date, assets, published):
    """The rows of a hike day: near the track, or taken while hiking with no usable GPS"""
    near = {asset["uuid"] for asset in day["near"]}
    times = [asset["taken"] for asset in day["near"]]
    # With neither a route nor geotagged photos, only the published photos are known to be of the hike
    start, end = (min(times) - WINDOW_MARGIN, max(times) + WINDOW_MARGIN) if times else (None, None)
    if day["hike"]:
        start, end = day["hike"]["window_start"], day["hike"]["window_end"]
    # A published photo belongs to the hike, also if it was taken outside the window
    picked = [a for a in assets if a["taken"].date() == date
              and (a["uuid"] in near or a["uuid"] in published or (start and start <= a["taken"] <= end))]
    for asset in sorted(picked, key=lambda a: a["taken"]):
        if asset["uuid"] in near:
            location = "on-track"
        else:
            location = "no-gps" if asset["lat"] is None else "off-track"
        yield asset, location


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--section", action="append", help="only this section, e.g. 41 or 29a (repeatable)")
    parser.add_argument("--library", type=Path, default=LIBRARY)
    parser.add_argument("--out", type=Path, default=Path.home() / "Downloads/trail-originals")
    parser.add_argument("--radius", type=int, default=150, help="meters from the track (default: 150)")
    parser.add_argument("--min-photos", type=int, default=3, help="photos needed to detect a hike day (default: 3)")
    parser.add_argument("--reference", action="append", default=[],
                        help="folder of copies with metadata, matched to published images by file name (repeatable)")
    parser.add_argument("--routes", type=Path, default=Path.home() / "Downloads/export.zip",
                        help="Apple Health export, zip or folder (default: ~/Downloads/export.zip)")
    parser.add_argument("--routes-only", action="store_true", help="only report the recorded hikes, without the library")
    parser.add_argument("--export", action="store_true", help="copy the originals of the hike days")
    args = parser.parse_args()

    sections = {map_id(section) for section in args.section} if args.section else None
    tracks = load_tracks(sections)
    if not tracks:
        sys.exit(f"No map for: {', '.join(sorted(sections))}")
    args.out.mkdir(parents=True, exist_ok=True)
    posts = [post for post in load_posts() if not sections or sections & set(post["sections"])]

    hikes = {}
    if args.routes.exists():
        hikes = find_hikes(args.routes, tracks)
        report_hikes(hikes, tracks, posts, args.reference, args.out)
    else:
        print(f"No Health export at {args.routes}, going by the photos alone\n")
    if args.routes_only:
        print(f"Hikes: {args.out / 'hikes.csv'}")
        return

    assets = load_assets(args.library)
    print(f"{len(assets)} photos in the library, {sum(a['lat'] is not None for a in assets)} with GPS, "
          f"{sum(a['local'] for a in assets)} stored locally\n")

    published, unmatched, confirmed = match_published(posts, assets, args.reference)
    days = find_hike_days(tracks, assets, args.radius, args.min_photos, confirmed, hikes)

    columns = ["section", "date", "status", "location", "taken", "lat", "lon", "route_lat", "route_lon",
               "name", "published", "local", "uuid", "path"]
    copied = 0
    with open(args.out / "manifest.csv", "w", newline="", encoding="utf-8-sig") as manifest:
        writer = csv.DictWriter(manifest, columns)
        writer.writeheader()
        print("section  date        status     photos  on-track  no-gps  off-track  published  cloud-only  coverage")
        for section in sorted(days):
            chosen = {d: v for d, v in days[section].items() if v["status"] != "passing"}
            if not chosen:
                print(f"{section:<8} no hike day found")
            for date, day in sorted(chosen.items()):
                rows = list(day_photos(day, date, assets, published))
                counts = defaultdict(int)
                for asset, location in rows:
                    counts[location] += 1
                    image = published.get(asset["uuid"], "")
                    counts["published"] += bool(image)
                    counts["cloud"] += not asset["local"]
                    route_lat, route_lon = route_position(day["hike"], asset["taken"]) if day["hike"] else (None, None)
                    writer.writerow({
                        "section": section, "date": date, "status": day["status"], "location": location,
                        "taken": asset["taken"].strftime("%Y-%m-%d %H:%M:%S"), "lat": asset["lat"], "lon": asset["lon"],
                        "route_lat": route_lat, "route_lon": route_lon,
                        "name": asset["name"], "published": image, "local": asset["local"],
                        "uuid": asset["uuid"], "path": asset["path"],
                    })
                    if args.export and asset["local"]:
                        target = args.out / f"section-{section}" / f"{asset['taken']:%Y%m%d-%H%M%S}-{asset['name']}"
                        target.parent.mkdir(exist_ok=True)
                        shutil.copy2(asset["path"], target)
                        copied += 1
                print(f"{section:<8} {date}  {day['status']:<9}  {len(rows):>6}  {counts['on-track']:>8}  "
                      f"{counts['no-gps']:>6}  {counts['off-track']:>9}  {counts['published']:>9}  "
                      f"{counts['cloud']:>10}  {day['coverage']:>7.0%}")

    if unmatched:
        print("\nPublished images with no original found:")
        for image, reason in unmatched:
            print(f"  {image}: {reason}")
    if args.export:
        print(f"\nCopied {copied} originals to {args.out}")
    print(f"\nManifest: {args.out / 'manifest.csv'}")


if __name__ == "__main__":
    main()
