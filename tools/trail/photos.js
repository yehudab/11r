// Find the photos of a trail post and place them on the section maps by their GPS tags.
import { promises as fs } from "node:fs";
import path from "node:path";
import exifr from "exifr";
import sharp from "sharp";
import { load as yamlLoad } from "js-yaml";
import { distance } from "./lib.js";
import { mapId } from "./site.js";
import { CANDIDATE_THUMBS_DIR } from "./photo-editor.js";
import { readMapPhotos } from "./keepers.js";

// Photos further than this from the section's track were not taken on the hike:
// pictures from another day (section 20), or GPS spoofing that wasn't corrected yet.
// Stops near the hike stay in - section 13's Mount Precipice photos are 5 km from the track.
export const MAX_DISTANCE_FROM_TRACK = 10000;

export const THUMBS_DIR = ".cache/map-thumbs"; // served as /img/thumbs
const THUMB_SIZE = 112; // twice the size on the map, for high density screens

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
    // exifr doesn't close the files it opens itself, which fails the build on Node 26
    const gps = await fs.readFile(file).then((photo) => exifr.gps(photo)).catch(() => null);
    return gps ? { lat: gps.latitude, lon: gps.longitude } : null;
}

// Thumbnails are kept between builds, and only made again when the photo changes
async function makeThumb(source, target) {
    const [photo, thumb] = await Promise.all([fs.stat(source), fs.stat(target).catch(() => null)]);
    if (thumb && thumb.mtimeMs >= photo.mtimeMs) return;
    await fs.mkdir(path.dirname(target), { recursive: true });
    await sharp(source).rotate().resize(THUMB_SIZE, THUMB_SIZE, { fit: "cover" }).webp({ quality: 70 }).toFile(target);
}

const webp = (file) => file.replace(/\.\w+$/, ".webp");

// Exported photos waiting for a decision, from <dir>/section-NN/*.jpg: their folder names the map
async function collectCandidates(dir, maps, photos, thumbsDir, published) {
    const folders = await fs.readdir(dir).catch(() => []);
    for (const folder of folders) {
        const number = folder.match(/^section-(.+)$/)?.[1];
        if (!maps[number]) continue;
        for (const name of (await fs.readdir(path.join(dir, folder))).filter((file) => /\.jpg$/i.test(file)).sort()) {
            if (published.has(`backfill/${folder}/${name}`)) continue;
            const file = path.join(dir, folder, name);
            const location = await readLocation(file);
            if (!location) {
                console.warn(`No location, not on the map: ${file}`);
                continue;
            }
            await makeThumb(file, path.join(thumbsDir, folder, webp(name)));
            photos[number].push({
                id: `backfill/${folder}/${name}`,
                src: `/backfill/${folder}/${name}`,
                thumb: `/backfill/thumbs/${folder}/${webp(name)}`,
                caption: name,
                candidate: true,
                ...location,
            });
        }
    }
}

async function listPosts(dir) {
    const entries = await fs.readdir(dir, { recursive: true });
    return entries.filter((entry) => entry.endsWith(".md")).sort().map((entry) => path.join(dir, entry));
}

// { number: [{ id, src, thumb, caption, lat, lon, postTitle, postUrl }] } for maps = { number: geometry }
// The site leaves out trashed photos. The editor shows them too, to allow changing your mind, and the candidates.
export async function collectPhotos(root, maps, { decisions = {}, editor = false, candidatesDir, candidateThumbsDir = CANDIDATE_THUMBS_DIR } = {}) {
    const postsDir = path.join(root, "src/posts");
    const tracks = Object.fromEntries(Object.entries(maps).map(([number, geometry]) => [number, coordinatesOf(geometry)]));
    const photos = Object.fromEntries(Object.keys(maps).map((number) => [number, []]));
    const inPosts = new Set();

    for (const file of await listPosts(postsDir)) {
        const post = parsePost(await fs.readFile(file, "utf-8"));
        if (!post) continue;
        const postTracks = Object.fromEntries(post.maps.filter((number) => tracks[number]).map((number) => [number, tracks[number]]));
        const postUrl = `/blog/${path.relative(postsDir, file).replace(/\.md$/, "")}/`;
        for (const { src, caption } of post.images) {
            inPosts.add(src);
            if (!editor && decisions[src] === "trash") continue;
            const location = await readLocation(path.join(root, src));
            const number = location && mapOf(location, postTracks, src);
            if (!number) continue;
            const thumb = webp(src.replace(/^img\//, ""));
            await makeThumb(path.join(root, src), path.join(root, THUMBS_DIR, thumb));
            photos[number].push({ id: src, src: `/${src}`, thumb: `/img/thumbs/${thumb}`, caption, ...location, postTitle: post.title, postUrl });
        }
    }
    // Photos kept for the map alone. Once a post uses one, the post's entry above takes over.
    const mapPhotos = await readMapPhotos(root);
    for (const [number, list] of Object.entries(mapPhotos)) {
        if (!photos[number]) continue;
        for (const { src } of list) {
            if (inPosts.has(src) || (!editor && decisions[src] === "trash")) continue;
            const location = await readLocation(path.join(root, src));
            if (!location) {
                console.warn(`No location, not on the map: ${src}`);
                continue;
            }
            const thumb = webp(src.replace(/^img\//, ""));
            await makeThumb(path.join(root, src), path.join(root, THUMBS_DIR, thumb));
            photos[number].push({ id: src, src: `/${src}`, thumb: `/img/thumbs/${thumb}`, caption: "", ...location });
        }
    }
    const published = new Set(Object.values(mapPhotos).flat().map((photo) => photo.from));
    if (editor && candidatesDir) await collectCandidates(candidatesDir, maps, photos, candidateThumbsDir, published);
    return photos;
}
