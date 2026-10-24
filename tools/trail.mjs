#!/usr/bin/env node
// Turn a recorded hike (GPX) into an Israel Trail section on the blog.
//
//   npm run trail -- <file.gpx> <section> --start "<from>" --end "<to>" [options]
//
// Writes public/topojson/trail-NN.topojson, registers the section in the progress
// map and the total-distance stats, updates the trail map page's lastUpdate, and
// prints the trail front matter for the section's post.
//
// Options:
//   --name "<map name>"     map title (default: "<from> ל<to>")
//   --post                  also create a draft post with the front matter filled in
//   --dry-run               print the stats and front matter, write nothing
//   --points-per-km <n>     map detail (default: 4)
//   --ascent <m>, --descent <m>
//                           override the GPS-based climb totals, e.g. with the
//                           Fitness app's barometric elevation gain
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { parseGpx, removeGlitches, trackStats, simplifyTrack } from "./trail/lib.js";
import {
    buildTopology, writeTopology, registerMapSection, registerDistance,
    touchTrailMapPage, frontMatter, writeDraftPost,
} from "./trail/site.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const { values: opts, positionals } = parseArgs({
    allowPositionals: true,
    options: {
        start: { type: "string" },
        end: { type: "string" },
        name: { type: "string" },
        post: { type: "boolean", default: false },
        "dry-run": { type: "boolean", default: false },
        "points-per-km": { type: "string", default: "4" },
        ascent: { type: "string" },
        descent: { type: "string" },
    },
});

const [gpxFile, section] = positionals;
if (!gpxFile || !section || !opts.start || !opts.end || !/^\d+[a-z]?$/.test(section)) {
    console.error('Usage: npm run trail -- <file.gpx> <section> --start "<from>" --end "<to>" [--name "<map name>"] [--post] [--dry-run] [--points-per-km 4] [--ascent m] [--descent m]');
    process.exit(1);
}

const points = removeGlitches(parseGpx(await fs.readFile(gpxFile, "utf-8")));
const stats = trackStats(points);
if (opts.ascent) stats.ascent = Number(opts.ascent);
if (opts.descent) stats.descent = Number(opts.descent);
const name = opts.name || `${opts.start} ל${opts.end}`;
const line = simplifyTrack(points, stats.distance, Number(opts["points-per-km"]));

console.log(`Section ${section}: ${name}`);
console.log(`Hiked ${stats.date}, ${points.length} track points → ${line.length} map points\n`);
console.log(frontMatter(section, opts.start, opts.end, stats) + "\n");

if (opts["dry-run"]) process.exit(0);

console.log("Wrote " + path.relative(root, await writeTopology(root, section, buildTopology(section, name, line))));
await registerMapSection(root, section);
await registerDistance(root, section, stats.distance);
await touchTrailMapPage(root);
console.log("Updated src/scripts/vega-map.js, src/globals/trailStats.js, src/pages/Israel-trail-map.md");

if (opts.post) {
    const file = await writeDraftPost(root, section, name, opts.start, opts.end, stats);
    console.log("Created " + path.relative(root, file));
}
