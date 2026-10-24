import { promises as fs } from "node:fs";
import path from "node:path";
import { topology } from "topojson-server";

// "4" → "04", "29a" stays "29a" (matches the map file and page names)
export function mapId(section) {
    return /^\d$/.test(String(section)) ? `0${section}` : String(section);
}

function sectionSortKey(section) {
    const [, num, suffix] = String(section).match(/^(\d+)(.*)$/);
    return [Number(num), suffix];
}

function compareSections(a, b) {
    const [na, sa] = sectionSortKey(a), [nb, sb] = sectionSortKey(b);
    return na - nb || sa.localeCompare(sb);
}

export function buildTopology(section, name, coordinates) {
    const object = `trail-${mapId(section)}`;
    const feature = {
        type: "Feature",
        properties: { name },
        geometry: { type: "LineString", coordinates },
    };
    return topology({ [object]: { type: "FeatureCollection", features: [feature] } });
}

export async function writeTopology(root, section, topo) {
    const file = path.join(root, "public/topojson", `trail-${mapId(section)}.topojson`);
    await fs.writeFile(file, JSON.stringify(topo, null, 2) + "\n");
    return file;
}

async function edit(file, transform) {
    const before = await fs.readFile(file, "utf-8");
    const after = transform(before);
    if (after !== before) await fs.writeFile(file, after);
}

// Add the section to `trailNumbers` in the progress map script
export async function registerMapSection(root, section) {
    const file = path.join(root, "src/scripts/vega-map.js");
    await edit(file, (src) => {
        const re = /^const trailNumbers = \[(.*)\];$/m;
        const match = src.match(re);
        if (!match) throw new Error(`${file}: trailNumbers line not found`);
        const items = JSON.parse(`[${match[1]}]`);
        const value = /^\d+$/.test(String(section)) ? Number(section) : String(section);
        if (!items.some((i) => String(i) === String(value))) items.push(value);
        items.sort(compareSections);
        return src.replace(re, `const trailNumbers = [${items.map((i) => JSON.stringify(i)).join(", ")}];`);
    });
}

// Add or update the section's distance in `legs` (feeds the total distance)
export async function registerDistance(root, section, km) {
    if (!/^\d+$/.test(String(section))) return;
    const file = path.join(root, "src/globals/trailStats.js");
    await edit(file, (src) => {
        const re = /^let legs = \{\n([\s\S]*?)\n\};$/m;
        const match = src.match(re);
        if (!match) throw new Error(`${file}: legs object not found`);
        const lines = match[1].split("\n").filter((l) => !new RegExp(`^\\s*${section}:`).test(l));
        lines.push(`  ${section}: {trailDistance: [${km}]},`);
        lines.sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
        return src.replace(re, `let legs = {\n${lines.join("\n")}\n};`);
    });
}

export async function touchTrailMapPage(root, now = new Date()) {
    const file = path.join(root, "src/pages/Israel-trail-map.md");
    await edit(file, (src) => {
        if (!/^lastUpdate: .*$/m.test(src)) throw new Error(`${file}: lastUpdate not found`);
        return src.replace(/^lastUpdate: .*$/m, `lastUpdate: '${now.toISOString().replace("Z", "+00:00")}'`);
    });
}

export function frontMatter(section, start, end, stats) {
    const yaml = (key, value) => `${key}: ${JSON.stringify([value])}`;
    return [
        `trailSerial: [${/^\d+$/.test(String(section)) ? Number(section) : JSON.stringify(String(section))}]`,
        yaml("trailStart", start),
        yaml("trailEnd", end),
        yaml("trailDirection", stats.direction),
        yaml("trailDistance", stats.distance),
        yaml("trailAscend", stats.ascent),
        yaml("trailDescend", stats.descent),
        yaml("trailMaxElevation", stats.maxElevation),
        yaml("trailMinElevation", stats.minElevation),
        yaml("trailNetTime", stats.netTime),
        yaml("trailTotalTime", stats.totalTime),
        yaml("trailAvgSpeed", stats.avgSpeed),
    ].join("\n");
}

// Draft post with the trail data filled in; refuses to overwrite an existing post
export async function writeDraftPost(root, section, name, start, end, stats) {
    const [year, month] = stats.date.split("-");
    const slug = `israel-trail-${section}`;
    const dir = path.join(root, "src/posts", year, month);
    const file = path.join(dir, `${slug}.md`);
    await fs.mkdir(dir, { recursive: true });
    const content = `---
date: '${stats.date}T15:00:00.000+00:00'
status: draft
author: יהודה
type: post
title: שביל ישראל ${section} - ${name}
path: ${slug}
excerpt: ''
ogImage: ''
tags:
- שביל ישראל

${frontMatter(section, start, end, stats)}
# trailEndImage: ["img/${year}/${month}/shvil-${section}-N.jpg"]
# trailEndImageAlt: [""]
# trailSongs: ["[name](https://song.link/...)"]
---
`;
    await fs.writeFile(file, content, { flag: "wx" });
    return file;
}
