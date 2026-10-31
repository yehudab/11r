// Publish the candidates kept in the map editor: copy them into img/ and list them in
// map-photos.json, which puts them on the site's map without being in any post.
import { promises as fs } from "node:fs";
import path from "node:path";

export const MAP_PHOTOS_FILE = "tools/trail/map-photos.json";

// { map number: [{ src, from }] }: src is the published photo, from its candidate's id
export async function readMapPhotos(root) {
    try {
        return JSON.parse(await fs.readFile(path.join(root, MAP_PHOTOS_FILE), "utf-8"));
    } catch (error) {
        if (error.code === "ENOENT") return {};
        throw error;
    }
}

// Copy to the next free img/YYYY/MM/shvil-NN-K.jpg, the name a post would use for it
async function copyToImg(root, number, name, source) {
    const [, year, month] = name.match(/^(\d{4})(\d{2})\d{2}-/) ?? [];
    if (!year) throw new Error(`No date in the name of ${source}`);
    const dir = path.join("img", year, month);
    await fs.mkdir(path.join(root, dir), { recursive: true });
    for (let serial = 1; ; serial++) {
        const src = path.join(dir, `shvil-${number}-${serial}.jpg`);
        try {
            await fs.copyFile(source, path.join(root, src), fs.constants.COPYFILE_EXCL);
            return src;
        } catch (error) {
            if (error.code !== "EEXIST") throw error;
        }
    }
}

// Safe to run again: a candidate that was already published is skipped.
export async function publishKeepers(root, decisions, candidatesDir) {
    const mapPhotos = await readMapPhotos(root);
    const done = new Set(Object.values(mapPhotos).flat().map((photo) => photo.from));
    // Sorted ids are in order of capture, since the file names start with the time taken
    const kept = Object.keys(decisions).sort()
        .filter((id) => decisions[id] === "keep" && id.startsWith("backfill/") && !done.has(id));
    const published = [];
    try {
        for (const id of kept) {
            const [, folder, name] = id.split("/");
            const number = folder.replace(/^section-/, "");
            const src = await copyToImg(root, number, name, path.join(candidatesDir, folder, name));
            (mapPhotos[number] ??= []).push({ src, from: id });
            published.push(src);
        }
    } finally {
        await fs.writeFile(path.join(root, MAP_PHOTOS_FILE), JSON.stringify(mapPhotos, null, 2) + "\n");
    }
    return published;
}
