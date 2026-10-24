// GPX → cleaned track → stats + simplified line.
// Stat parameters were calibrated against the hand-entered stats of 21 published
// trail posts (sections 1–30) and their original Apple Health recordings.

const EARTH_RADIUS = 6371000;
const MAX_SPEED = 8;            // m/s; faster jumps between points are GPS glitches
const DISTANCE_STEP = 10;       // m; ignore jitter smaller than this when summing distance
const MOVING_WINDOW = 120;      // s; speed is measured over this window...
const MOVING_SPEED = 0.15;      // m/s; ...and counts as moving above this
const ELEVATION_WINDOW = 240;   // s; elevation is averaged over this window...
const ELEVATION_STEP = 5;       // m; ...and climbs smaller than this are ignored
const TIME_ZONE = "Asia/Jerusalem";

export function parseGpx(xml) {
    const points = [];
    for (const [, attrs, body] of xml.matchAll(/<trkpt\b([^>]*)>([\s\S]*?)<\/trkpt>/g)) {
        const lat = Number(attrs.match(/\blat="([^"]+)"/)?.[1]);
        const lon = Number(attrs.match(/\blon="([^"]+)"/)?.[1]);
        const ele = Number(body.match(/<ele>([^<]+)<\/ele>/)?.[1]);
        const time = Date.parse(body.match(/<time>([^<]+)<\/time>/)?.[1]);
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
            points.push({ lat, lon, ele: Number.isFinite(ele) ? ele : null, time: Number.isFinite(time) ? time / 1000 : null });
        }
    }
    if (points.length < 2) throw new Error("GPX has fewer than 2 track points");
    if (points.some((p) => p.time === null)) throw new Error("GPX track points must have timestamps");
    return points;
}

export function distance(a, b) {
    const toRad = Math.PI / 180;
    const dLat = (b.lat - a.lat) * toRad;
    const dLon = (b.lon - a.lon) * toRad;
    const h = Math.sin(dLat / 2) ** 2 +
        Math.cos(a.lat * toRad) * Math.cos(b.lat * toRad) * Math.sin(dLon / 2) ** 2;
    return 2 * EARTH_RADIUS * Math.asin(Math.sqrt(h));
}

// Drop points that would require moving faster than MAX_SPEED from the last kept point
export function removeGlitches(points) {
    const kept = [points[0]];
    for (const p of points.slice(1)) {
        const last = kept[kept.length - 1];
        const dt = Math.max(p.time - last.time, 1);
        if (distance(last, p) / dt <= MAX_SPEED) kept.push(p);
    }
    return kept;
}

function trackDistance(points) {
    let total = 0;
    let anchor = points[0];
    for (const p of points.slice(1)) {
        const d = distance(anchor, p);
        if (d >= DISTANCE_STEP) {
            total += d;
            anchor = p;
        }
    }
    return total;
}

function movingSeconds(points) {
    let total = 0;
    let j = 0;
    for (let i = 1; i < points.length; i++) {
        const dt = points[i].time - points[i - 1].time;
        if (dt <= 0) continue;
        while (points[i].time - points[j].time > MOVING_WINDOW) j++;
        const span = points[i].time - points[j].time;
        const speed = span > 0 ? distance(points[j], points[i]) / span : 0;
        if (speed >= MOVING_SPEED) total += Math.min(dt, MOVING_WINDOW);
    }
    return total;
}

function smoothedElevations(points) {
    const withEle = points.filter((p) => p.ele !== null);
    let lo = 0, hi = 0, sum = 0;
    return withEle.map((p) => {
        while (hi < withEle.length && withEle[hi].time <= p.time + ELEVATION_WINDOW / 2) sum += withEle[hi++].ele;
        while (withEle[lo].time < p.time - ELEVATION_WINDOW / 2) sum -= withEle[lo++].ele;
        return sum / (hi - lo);
    });
}

function climbs(elevations) {
    let ascent = 0, descent = 0;
    let ref = elevations[0];
    for (const e of elevations.slice(1)) {
        if (e - ref >= ELEVATION_STEP) { ascent += e - ref; ref = e; }
        else if (ref - e >= ELEVATION_STEP) { descent += ref - e; ref = e; }
    }
    return { ascent, descent };
}

function hoursMinutes(seconds) {
    const minutes = Math.round(seconds / 60);
    return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
}

export function localDate(seconds) {
    return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date(seconds * 1000));
}

export function trackStats(points) {
    const first = points[0];
    const last = points[points.length - 1];
    const km = trackDistance(points) / 1000;
    const totalSeconds = last.time - first.time;
    const elevations = points.filter((p) => p.ele !== null).map((p) => p.ele);
    const { ascent, descent } = elevations.length ? climbs(smoothedElevations(points)) : { ascent: 0, descent: 0 };

    return {
        date: localDate(first.time),
        start: first,
        end: last,
        direction: last.lat <= first.lat ? "southbound" : "northbound",
        distance: Math.round(km * 10) / 10,
        ascent: Math.round(ascent),
        descent: Math.round(descent),
        maxElevation: elevations.length ? Math.round(Math.max(...elevations)) : null,
        minElevation: elevations.length ? Math.round(Math.min(...elevations)) : null,
        netTime: hoursMinutes(movingSeconds(points)),
        totalTime: hoursMinutes(totalSeconds),
        avgSpeed: Math.round(km / (totalSeconds / 3600) * 10) / 10,
    };
}

// Douglas–Peucker on a local flat projection (meters)
function douglasPeucker(xy, tolerance) {
    const keep = new Uint8Array(xy.length);
    keep[0] = keep[xy.length - 1] = 1;
    const stack = [[0, xy.length - 1]];
    while (stack.length) {
        const [a, b] = stack.pop();
        const [ax, ay] = xy[a], [bx, by] = xy[b];
        const dx = bx - ax, dy = by - ay;
        const len2 = dx * dx + dy * dy;
        let maxDist = -1, index = -1;
        for (let i = a + 1; i < b; i++) {
            const [px, py] = xy[i];
            const t = len2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2)) : 0;
            const d = Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
            if (d > maxDist) { maxDist = d; index = i; }
        }
        if (maxDist > tolerance) {
            keep[index] = 1;
            stack.push([a, index], [index, b]);
        }
    }
    return keep;
}

// Simplify to about `pointsPerKm` points per kilometer, coordinates rounded to 5 decimals
export function simplifyTrack(points, km, pointsPerKm = 4) {
    const lat0 = points[0].lat * Math.PI / 180;
    const xy = points.map((p) => [
        p.lon * Math.PI / 180 * EARTH_RADIUS * Math.cos(lat0),
        p.lat * Math.PI / 180 * EARTH_RADIUS,
    ]);
    const target = Math.max(10, Math.round(km * pointsPerKm));
    let lo = 0, hi = 1000, keep = douglasPeucker(xy, hi);
    for (let i = 0; i < 30; i++) {
        const mid = (lo + hi) / 2;
        const candidate = douglasPeucker(xy, mid);
        if (candidate.reduce((n, k) => n + k, 0) > target) lo = mid;
        else { hi = mid; keep = candidate; }
    }
    return points
        .filter((_, i) => keep[i])
        .map((p) => [Math.round(p.lon * 1e5) / 1e5, Math.round(p.lat * 1e5) / 1e5]);
}
