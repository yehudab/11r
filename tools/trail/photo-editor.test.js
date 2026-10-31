// Test cases: the dev server API of the map editor, over a real HTTP server.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { photoEditorMiddleware, readDecisions } from "./photo-editor.js";

const dir = await fs.mkdtemp(path.join(os.tmpdir(), "photo-editor-"));
const decisionsFile = path.join(dir, "decisions.json");
const candidatesDir = path.join(dir, "candidates");
let server, origin;

before(async () => {
    await fs.mkdir(path.join(candidatesDir, "section-41"), { recursive: true });
    await fs.writeFile(path.join(candidatesDir, "section-41/a.jpg"), "jpeg");
    await fs.writeFile(path.join(dir, "secret.jpg"), "secret");
    const middleware = photoEditorMiddleware({ decisionsFile, candidatesDir, thumbsDir: path.join(dir, "thumbs") });
    server = http.createServer((req, res) => middleware(req, res, () => {
        res.statusCode = 404;
        res.end();
    }));
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    origin = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

const post = (body, headers = {}) => fetch(`${origin}/api/photo-decisions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin, ...headers },
    body: JSON.stringify(body),
});

test("decisions are saved, replaced and cleared", async () => {
    const id = "img/2024/04/shvil-17-1.jpg";
    assert.equal((await post({ id, status: "trash" })).status, 200);
    assert.deepEqual(await readDecisions(decisionsFile), { [id]: "trash" });
    assert.equal((await post({ id, status: "keep" })).status, 200);
    assert.deepEqual(await (await fetch(`${origin}/api/photo-decisions`)).json(), { [id]: "keep" });
    assert.equal((await post({ id, status: null })).status, 200);
    assert.deepEqual(await readDecisions(decisionsFile), {});
});

test("quick decisions in a row are all saved", async () => {
    const ids = Array.from({ length: 20 }, (_, index) => `backfill/section-41/p${index}.jpg`);
    await Promise.all(ids.map((id) => post({ id, status: "keep" })));
    assert.equal(Object.keys(await readDecisions(decisionsFile)).length, 20);
});

test("bad photos and statuses are rejected", async () => {
    for (const body of [{ id: "img/../../etc/passwd.jpg", status: "keep" }, { id: "other/a.jpg", status: "keep" }, { id: "img/a.jpg", status: "maybe" }, {}]) {
        assert.equal((await post(body)).status, 400, JSON.stringify(body));
    }
});

test("only local pages can change decisions", async () => {
    const body = { id: "img/a.jpg", status: "trash" };
    assert.equal((await post(body, { Origin: "https://example.com" })).status, 403);
    const form = await fetch(`${origin}/api/photo-decisions`, { method: "POST", headers: { "Content-Type": "text/plain", Origin: origin }, body: JSON.stringify(body) });
    assert.equal(form.status, 403);
    const status = await new Promise((resolve, reject) => {
        const request = http.request(`${origin}/api/photo-decisions`, { method: "POST", headers: { Host: "192.168.1.5:8080", Origin: "http://192.168.1.5:8080", "Content-Type": "application/json" } }, (res) => resolve(res.statusCode));
        request.on("error", reject);
        request.end(JSON.stringify(body));
    });
    assert.equal(status, 403);
    assert.equal((await readDecisions(decisionsFile))["img/a.jpg"], undefined);
});

test("candidates are served, and nothing outside of their folder", async () => {
    const photo = await fetch(`${origin}/backfill/section-41/a.jpg`);
    assert.equal(photo.status, 200);
    assert.equal(photo.headers.get("content-type"), "image/jpeg");
    assert.equal((await fetch(`${origin}/backfill/section-41/missing.jpg`)).status, 404);
    assert.equal((await fetch(`${origin}/backfill/%2e%2e/secret.jpg`)).status, 404);
});

test("other requests pass through", async () => {
    assert.equal((await fetch(`${origin}/maps/trail-41/`)).status, 404);
});
