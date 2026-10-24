// Test case: the original recording of section 30 (30 May 2025) must reproduce
// the published trail-30 map and the stats in the section 30 post.
import { test } from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { feature } from "topojson-client";
import { parseGpx, removeGlitches, trackStats, simplifyTrack, distance } from "./lib.js";
import {
    mapId, buildTopology, writeTopology, registerMapSection, registerDistance,
    touchTrailMapPage, writeDraftPost,
} from "./site.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");

const points = removeGlitches(parseGpx(await fs.readFile(path.join(here, "fixtures/trail-30.gpx"), "utf-8")));
const stats = trackStats(points);

const published = JSON.parse(await fs.readFile(path.join(root, "public/topojson/trail-30.topojson"), "utf-8"));
const publishedLine = feature(published, published.objects["trail-30"]).features[0].geometry.coordinates
    .map(([lon, lat]) => ({ lat, lon }));

// Distance (m) from p to the nearest segment of line, on a local flat projection
function distanceToLine(p, line) {
    const mPerDeg = 111320, cos = Math.cos(p.lat * Math.PI / 180);
    const xy = ({ lat, lon }) => [(lon - p.lon) * mPerDeg * cos, (lat - p.lat) * mPerDeg];
    let best = Infinity;
    for (let i = 1; i < line.length; i++) {
        const [ax, ay] = xy(line[i - 1]), [bx, by] = xy(line[i]);
        const dx = bx - ax, dy = by - ay;
        const t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / (dx * dx + dy * dy || 1)));
        best = Math.min(best, Math.hypot(ax + t * dx, ay + t * dy));
    }
    return best;
}

test("stats match the section 30 post", () => {
    assert.equal(stats.date, "2025-05-30");
    assert.equal(stats.direction, "southbound");
    assert.ok(Math.abs(stats.distance - 11.6) <= 0.2, `distance ${stats.distance}`);
    assert.equal(stats.avgSpeed, 2.4);
    assert.ok(Math.abs(stats.maxElevation - 44) <= 2, `max elevation ${stats.maxElevation}`);
    const [h, m] = stats.totalTime.split(":").map(Number);
    assert.ok(Math.abs(h * 60 + m - (4 * 60 + 48)) <= 2, `total time ${stats.totalTime}`);
    // Net time and ascent depend on smoothing; the post's values came from another app
    assert.match(stats.netTime, /^\d+:\d\d$/);
    assert.ok(stats.ascent >= 0 && stats.descent >= 0);
});

test("simplified line follows the published trail-30 map", () => {
    const line = simplifyTrack(points, stats.distance).map(([lon, lat]) => ({ lat, lon }));
    assert.ok(line.length >= 40 && line.length <= 50, `${line.length} points`);
    assert.ok(distance(line[0], publishedLine[0]) < 30, "start point");
    assert.ok(distance(line.at(-1), publishedLine.at(-1)) < 30, "end point");
    const worst = Math.max(...line.map((p) => distanceToLine(p, publishedLine)));
    assert.ok(worst < 100, `farthest point is ${Math.round(worst)} m from the published line`);
});

test("glitch points are dropped", () => {
    const base = { lat: 32, lon: 34.8, ele: 10, time: 1000 };
    const track = [base, { ...base, lat: 33, time: 1001 }, { ...base, lat: 32.0001, time: 1010 }];
    assert.equal(removeGlitches(track).length, 2);
});

test("map ids are zero-padded like the map files", () => {
    assert.equal(mapId(4), "04");
    assert.equal(mapId("30"), "30");
    assert.equal(mapId("29a"), "29a");
});

test("writes the map, registers the section and drafts the post", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "trail-test-"));
    for (const file of ["src/scripts/vega-map.js", "src/globals/trailStats.js", "src/pages/Israel-trail-map.md"]) {
        await fs.mkdir(path.join(tmp, path.dirname(file)), { recursive: true });
        await fs.copyFile(path.join(root, file), path.join(tmp, file));
    }
    await fs.mkdir(path.join(tmp, "public/topojson"), { recursive: true });

    const line = simplifyTrack(points, stats.distance);
    await writeTopology(tmp, "99", buildTopology("99", "נחל פולג לאפולוניה", line));
    for (let i = 0; i < 2; i++) {   // running twice must not duplicate anything
        await registerMapSection(tmp, "99");
        await registerDistance(tmp, "99", stats.distance);
    }
    await touchTrailMapPage(tmp, new Date("2026-10-24T12:00:00Z"));
    const post = await writeDraftPost(tmp, "99", "נחל פולג לאפולוניה", "נחל פולג", "אפולוניה", stats);

    const topo = JSON.parse(await fs.readFile(path.join(tmp, "public/topojson/trail-99.topojson"), "utf-8"));
    const geo = feature(topo, topo.objects["trail-99"]).features[0];
    assert.equal(geo.geometry.type, "LineString");
    assert.equal(geo.properties.name, "נחל פולג לאפולוניה");
    assert.deepEqual(topo.bbox.length, 4);

    const vega = await fs.readFile(path.join(tmp, "src/scripts/vega-map.js"), "utf-8");
    assert.match(vega, /, 99\];/);
    assert.equal(vega.match(/\b99\b/g).length, 1);
    const legs = await fs.readFile(path.join(tmp, "src/globals/trailStats.js"), "utf-8");
    assert.equal(legs.match(/^\s*99:/gm).length, 1);
    assert.match(legs, /\n  99: \{trailDistance: \[11\.6\]\},\n\};/);
    const page = await fs.readFile(path.join(tmp, "src/pages/Israel-trail-map.md"), "utf-8");
    assert.match(page, /^lastUpdate: '2026-10-24T12:00:00.000\+00:00'$/m);

    assert.equal(path.relative(tmp, post), "src/posts/2025/05/israel-trail-99.md");
    const draft = await fs.readFile(post, "utf-8");
    assert.match(draft, /^status: draft$/m);
    assert.match(draft, /^trailSerial: \[99\]$/m);
    assert.match(draft, /^trailDistance: \[11\.6\]$/m);
    await assert.rejects(writeDraftPost(tmp, "99", "x", "a", "b", stats), /EEXIST/);   // never overwrites a post

    await fs.rm(tmp, { recursive: true });
});
