// Find the photos of a trail post and place them on the section maps by their GPS tags.
import { promises as fs } from "node:fs";
import path from "node:path";
import exifr from "exifr";
import { load as yamlLoad } from "js-yaml";
import { distance } from "./lib.js";
import { mapId } from "./site.js";

// Photos further than this from the section's track were not taken on the hike:
// pictures from another day (section 20), or GPS spoofing that wasn't corrected yet.
// Stops near the hike stay in - section 13's Mount Precipice photos are 5 km from the track.
export const MAX_DISTANCE_FROM_TRACK = 10000;

// The maps and photos of a published trail post, or null for any other post
export function parsePost(text) {
    const match = text.match(/^\s*---\r?\n([\s\S]*?)\r?\n---\s*\r?\n([\s\S]*)$/);
    // Only trail posts are parsed: the YAML of some of the old imported posts is too loose for js-yaml
    if (!match || !/^trailSerial:/m.test(match[1])) return null;
    const data = yamlLoad(match[1]);
    if (data.draft || data.status !== "publish") return null;

    const images = new Map();
    for (const [, alt, src, title] of match[2].matchAll(/!\[([^\]]*)\]\(\/?(img\/[^\s)]+)(?:\s+"([^"]*)")?\)/g)) {
        if (!images.has(src)) images.set(src, { src, caption: title || alt });
    }
    // The group photo at the end of the post, one per section in a multi-section post
    [data.trailEndImage].flat().forEach((image, index) => {
        const src = image?.replace(/^\//, "");
        if (src && !images.has(src)) images.set(src, { src, caption: [data.trailEndImageAlt].flat()[index] || "" });
    });
    return {
        title: data.title,
        maps: (data.trailMaps || data.trailSerial).map(mapId),
        images: [...images.values()],
    };
}

function coordinatesOf(geometry) {
    return geometry.type === "LineString" ? geometry.coordinates : geometry.coordinates.flat();
}

// The track's points are a few hundred meters apart, close enough for a 10 km limit
function distanceFromTrack(photo, coordinates) {
    return Math.min(...coordinates.map(([lon, lat]) => distance(photo, { lat, lon })));
}

// Pick the map a photo belongs on, out of the maps of its post: { number: coordinates }
// A file named after one of them settles it, which matters where sections meet: the
// overnight camp is as close to section 23 as to 24, but shvil-23-11 belongs to 23.
export function mapOf(photo, tracks, src = "") {
    const named = mapId(path.basename(src).match(/^shvil-(\d+)-/)?.[1] ?? "");
    if (tracks[named] && distanceFromTrack(photo, tracks[named]) <= MAX_DISTANCE_FROM_TRACK) return named;

    let nearest = null;
    let nearestDistance = MAX_DISTANCE_FROM_TRACK;
    for (const [number, coordinates] of Object.entries(tracks)) {
        const meters = distanceFromTrack(photo, coordinates);
        if (meters <= nearestDistance) {
            nearest = number;
            nearestDistance = meters;
        }
    }
    return nearest;
}

async function readLocation(file) {
    const gps = await exifr.gps(file).catch(() => null);
    return gps ? { lat: gps.latitude, lon: gps.longitude } : null;
}

async function listPosts(dir) {
    const entries = await fs.readdir(dir, { recursive: true });
    return entries.filter((entry) => entry.endsWith(".md")).sort().map((entry) => path.join(dir, entry));
}

// { number: [{ src, caption, lat, lon, postTitle, postUrl }] } for maps = { number: geometry }
export async function collectPhotos(root, maps) {
    const postsDir = path.join(root, "src/posts");
    const tracks = Object.fromEntries(Object.entries(maps).map(([number, geometry]) => [number, coordinatesOf(geometry)]));
    const photos = Object.fromEntries(Object.keys(maps).map((number) => [number, []]));

    for (const file of await listPosts(postsDir)) {
        const post = parsePost(await fs.readFile(file, "utf-8"));
        if (!post) continue;
        const postTracks = Object.fromEntries(post.maps.filter((number) => tracks[number]).map((number) => [number, tracks[number]]));
        const postUrl = `/blog/${path.relative(postsDir, file).replace(/\.md$/, "")}/`;
        for (const { src, caption } of post.images) {
            const location = await readLocation(path.join(root, src));
            const number = location && mapOf(location, postTracks, src);
            if (number) photos[number].push({ src: `/${src}`, caption, ...location, postTitle: post.title, postUrl });
        }
    }
    return photos;
}
