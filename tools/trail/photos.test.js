// Test cases: the published sections whose photos have something to get wrong.
import { test } from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { feature } from "topojson-client";
import { parsePost, mapOf, collectPhotos } from "./photos.js";
import os from "node:os";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

async function geometryOf(number) {
    const topology = JSON.parse(await fs.readFile(path.join(root, `public/topojson/trail-${number}.topojson`), "utf-8"));
    return feature(topology, topology.objects[`trail-${number}`]).features[0].geometry;
}

const post = (frontMatter, body = "") => `---\ntitle: t\nstatus: publish\n${frontMatter}\n---\n${body}`;

test("parsePost reads maps and photos of a trail post", () => {
    const parsed = parsePost(post("trailSerial: [4]", '![alt](/img/a.jpg "title")\n![only alt](/img/b.jpg)\n![again](/img/a.jpg)\n'));
    assert.deepEqual(parsed.maps, ["04"]);
    assert.deepEqual(parsed.images, [
        { src: "img/a.jpg", caption: "title" },
        { src: "img/b.jpg", caption: "only alt" },
    ]);
});

test("parsePost adds the end image of the post, also when given as a list", () => {
    const single = parsePost(post("trailSerial: [4]\ntrailEndImage: img/e.jpg\ntrailEndImageAlt: [group]", "![a](/img/a.jpg)"));
    assert.deepEqual(single.images.map((image) => image.src), ["img/a.jpg", "img/e.jpg"]);
    assert.equal(single.images[1].caption, "group");
    const list = parsePost(post('trailSerial: [4]\ntrailEndImage: ["img/a.jpg"]', "![a](/img/a.jpg)"));
    assert.deepEqual(list.images, [{ src: "img/a.jpg", caption: "a" }]);
    assert.equal(parsePost(post("trailSerial: [4]")).images.length, 0);
});

test("parsePost prefers trailMaps, and skips other posts and drafts", () => {
    assert.deepEqual(parsePost(post('trailSerial: [29]\ntrailMaps: ["29a", "29b"]')).maps, ["29a", "29b"]);
    assert.equal(parsePost(post("tags: [x]")), null);
    assert.equal(parsePost(post("trailSerial: [4]\ndraft: true")), null);
    assert.equal(parsePost("no front matter"), null);
});

test("mapOf prefers the section in the file name, then the closest track, and rejects far away photos", () => {
    const tracks = { a: [[35, 32]], b: [[35.05, 32]] };
    assert.equal(mapOf({ lat: 32, lon: 35.04 }, tracks), "b");
    assert.equal(mapOf({ lat: 33, lon: 35 }, tracks), null);
    assert.equal(mapOf({ lat: 32, lon: 35 }, {}), null);

    const meeting = { 23: [[35, 32]], 24: [[35.002, 32]] };
    assert.equal(mapOf({ lat: 32, lon: 35.0019 }, meeting, "img/shvil-23-1.jpg"), "23");
    assert.equal(mapOf({ lat: 32, lon: 35.0001 }, meeting, "img/shvil-24-1.jpg"), "24");
    assert.equal(mapOf({ lat: 32, lon: 35.0019 }, meeting, "img/shvil-29-1.jpg"), "24");
    assert.equal(mapOf({ lat: 33, lon: 35 }, meeting, "img/shvil-23-1.jpg"), null);
});

test("collectPhotos places published photos on the right maps", async () => {
    const numbers = ["13", "17", "23", "24", "29a", "29b", "41"];
    const maps = Object.fromEntries(await Promise.all(numbers.map(async (n) => [n, await geometryOf(n)])));
    const photos = await collectPhotos(root, maps);
    const names = (number) => photos[number].map((photo) => path.basename(photo.src));

    // shvil-17-1, 5, 6 were spoofed to Beirut, and retagged from the recorded route
    assert.ok(names("17").includes("shvil-17-1.jpg"));
    // Mount Precipice, a stop 5 km from the track
    assert.ok(names("13").includes("shvil-13-2.jpg"));
    // The overnight camp between 23 and 24: each photo once, on the map of its file name
    assert.ok(names("23").includes("shvil-23-13.jpg") && !names("24").includes("shvil-23-13.jpg"));
    assert.ok(names("24").includes("shvil-24-1.jpg") && !names("23").includes("shvil-24-1.jpg"));
    // Both days of a two-section post, split by location, without the photo from 18 km away
    assert.ok(names("23").includes("shvil-23-3.jpg"));
    assert.ok(!names("23").includes("shvil-23-1.jpg"));
    assert.ok(photos["24"].length > 0);
    // The file names are of section 29, but the maps are 29a and 29b
    assert.ok(photos["29a"].length + photos["29b"].length > 0);
    // Tagged from the library after the published files had lost their metadata
    assert.equal(photos["41"].length, 7);

    const [photo] = photos["17"];
    assert.equal(photo.postUrl, "/blog/2024/04/israel-trail-17/");
    assert.match(photo.src, /^\/img\/2024\/04\//);
});

test("thumbnails are small squares, and the site leaves out trashed photos", async () => {
    const maps = { 17: await geometryOf("17") };
    const photos = await collectPhotos(root, maps);
    const [photo] = photos["17"];
    assert.match(photo.thumb, /^\/img\/thumbs\/2024\/04\/.+\.webp$/);
    const thumb = path.join(root, ".cache/map-thumbs", photo.thumb.replace("/img/thumbs/", ""));
    const { width, height, format } = await sharp(thumb).metadata();
    assert.deepEqual([width, height, format], [112, 112, "webp"]);
    assert.ok((await fs.stat(thumb)).size < 10000);

    const decisions = { [photo.id]: "trash" };
    const site = await collectPhotos(root, maps, { decisions });
    assert.ok(!site["17"].some((p) => p.id === photo.id));
    const editor = await collectPhotos(root, maps, { decisions, editor: true });
    assert.ok(editor["17"].some((p) => p.id === photo.id));
});

test("candidates are only for the editor, on the map of their folder", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "candidates-"));
    await fs.mkdir(path.join(dir, "section-17"));
    await fs.mkdir(path.join(dir, "section-99"));
    const tagged = path.join(root, "img/2024/04/shvil-17-2.jpg");
    await fs.copyFile(tagged, path.join(dir, "section-17/tagged.jpg"));
    await fs.copyFile(tagged, path.join(dir, "section-99/no-such-map.jpg"));
    await fs.copyFile(path.join(root, "img/2025/04/shvil-28-2.jpg"), path.join(dir, "section-17/no-location.jpg"));

    const options = { candidatesDir: dir, candidateThumbsDir: path.join(dir, "thumbs") };
    const maps = { 17: await geometryOf("17") };
    const site = await collectPhotos(root, maps, options);
    assert.ok(!site["17"].some((photo) => photo.candidate));

    const editor = await collectPhotos(root, maps, { ...options, editor: true });
    const candidates = editor["17"].filter((photo) => photo.candidate);
    assert.deepEqual(candidates.map((photo) => photo.id), ["backfill/section-17/tagged.jpg"]);
    assert.equal(candidates[0].thumb, "/backfill/thumbs/section-17/tagged.webp");
});
