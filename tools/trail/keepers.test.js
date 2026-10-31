import { test } from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { publishKeepers, readMapPhotos } from "./keepers.js";
import { collectPhotos } from "./photos.js";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const geotagged = path.join(repo, "img/2024/04/shvil-17-2.jpg");
const id = (name) => `backfill/section-32/${name}`;

async function setup() {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "keepers-"));
    const candidates = path.join(root, "candidates");
    await fs.mkdir(path.join(candidates, "section-32"), { recursive: true });
    await fs.mkdir(path.join(root, "src/posts"), { recursive: true });
    await fs.mkdir(path.join(root, "tools/trail"), { recursive: true });
    for (const name of ["20251031-070000-a.jpg", "20251031-080000-b.jpg", "20251031-090000-c.jpg"]) {
        await fs.copyFile(geotagged, path.join(candidates, "section-32", name));
    }
    return { root, candidates };
}

test("only kept candidates are published, in order of capture, without overwriting", async () => {
    const { root, candidates } = await setup();
    await fs.mkdir(path.join(root, "img/2025/10"), { recursive: true });
    await fs.writeFile(path.join(root, "img/2025/10/shvil-32-1.jpg"), "taken");
    const decisions = {
        [id("20251031-090000-c.jpg")]: "keep",
        [id("20251031-070000-a.jpg")]: "keep",
        [id("20251031-080000-b.jpg")]: "trash",
        "img/2025/06/shvil-30-1.jpg": "keep",
    };
    const published = await publishKeepers(root, decisions, candidates);
    assert.deepEqual(published, ["img/2025/10/shvil-32-2.jpg", "img/2025/10/shvil-32-3.jpg"]);
    assert.equal(await fs.readFile(path.join(root, "img/2025/10/shvil-32-1.jpg"), "utf-8"), "taken");

    assert.deepEqual(await publishKeepers(root, decisions, candidates), [], "running again changes nothing");
    assert.equal((await readMapPhotos(root))["32"].length, 2);
});

test("published keepers are on the site's map, replace their candidate, and can be trashed", async () => {
    const { root, candidates } = await setup();
    const kept = id("20251031-070000-a.jpg");
    const [src] = await publishKeepers(root, { [kept]: "keep" }, candidates);
    const maps = { 32: { type: "LineString", coordinates: [[35, 32]] } };
    const options = { candidatesDir: candidates, candidateThumbsDir: path.join(root, "thumbs") };

    const site = await collectPhotos(root, maps, options);
    assert.deepEqual(site["32"].map((photo) => photo.id), [src]);
    assert.equal(site["32"][0].postUrl, undefined);

    const editor = await collectPhotos(root, maps, { ...options, editor: true });
    assert.deepEqual(editor["32"].map((photo) => photo.id).sort(), [
        id("20251031-080000-b.jpg"), id("20251031-090000-c.jpg"), src,
    ].sort());

    const trashed = await collectPhotos(root, maps, { ...options, decisions: { [src]: "trash" } });
    assert.equal(trashed["32"].length, 0);
});
