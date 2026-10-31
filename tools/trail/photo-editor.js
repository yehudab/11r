// The dev server's side of the map editor: keep or trash decisions on photos, and the
// exported candidates for the backfill, which live outside of the site.
import { createReadStream, promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

export const DECISIONS_FILE = path.join(here, "photo-decisions.json");
export const CANDIDATES_DIR = process.env.TRAIL_BACKFILL_DIR || path.join(os.homedir(), "Downloads/trail-originals");
export const CANDIDATE_THUMBS_DIR = path.resolve(here, "../../.cache/map-thumbs-backfill");

const API_PATH = "/api/photo-decisions";
const PHOTO_ID = /^(img|backfill)\/[\w\-./]+\.(jpe?g|png|webp)$/i;
const STATUSES = ["keep", "trash", null];
const MAX_BODY = 4096;
const CONTENT_TYPES = { ".jpg": "image/jpeg", ".webp": "image/webp" };

// { photo id: "keep" | "trash" }, a photo with no decision isn't listed
export async function readDecisions(file = DECISIONS_FILE) {
    try {
        return JSON.parse(await fs.readFile(file, "utf-8"));
    } catch (error) {
        if (error.code === "ENOENT") return {};
        throw error;
    }
}

// Sorted, to keep the file's diffs readable. Replaced in one step, never left half written.
async function writeDecisions(file, decisions) {
    const sorted = Object.fromEntries(Object.entries(decisions).sort(([a], [b]) => a.localeCompare(b)));
    const temp = `${file}.tmp`;
    await fs.writeFile(temp, JSON.stringify(sorted, null, 2) + "\n");
    await fs.rename(temp, file);
}

function send(res, status, body) {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(body));
}

function isLocalHost(host = "") {
    return /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host);
}

// The dev server listens on all interfaces: only pages it served from this machine may
// change anything, and requiring JSON keeps other sites' forms out.
function isLocalRequest(req) {
    const origin = req.headers.origin;
    return isLocalHost(req.headers.host) && !!origin && origin.replace(/^https?:\/\//, "") === req.headers.host
        && /^application\/json\b/.test(req.headers["content-type"] || "");
}

async function readBody(req) {
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
        size += chunk.length;
        if (size > MAX_BODY) throw new Error("Body too large");
        chunks.push(chunk);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf-8"));
}

function serveFile(res, next, dir, relative) {
    const file = path.resolve(dir, relative);
    const contentType = CONTENT_TYPES[path.extname(file).toLowerCase()];
    if (!contentType || !file.startsWith(path.resolve(dir) + path.sep)) return next();
    const stream = createReadStream(file);
    stream.on("open", () => {
        res.setHeader("Content-Type", contentType);
        stream.pipe(res);
    });
    stream.on("error", () => next());
}

export function photoEditorMiddleware({
    decisionsFile = DECISIONS_FILE,
    candidatesDir = CANDIDATES_DIR,
    thumbsDir = CANDIDATE_THUMBS_DIR,
} = {}) {
    // One write at a time, for quick clicks in a row
    let writes = Promise.resolve();

    async function decide(req, res) {
        if (!isLocalRequest(req)) return send(res, 403, { error: "Local requests only" });
        let id, status;
        try {
            ({ id, status = null } = await readBody(req));
        } catch {
            return send(res, 400, { error: "Bad request" });
        }
        if (typeof id !== "string" || !PHOTO_ID.test(id) || id.includes("..") || !STATUSES.includes(status)) {
            return send(res, 400, { error: "Bad photo or status" });
        }
        const write = writes.then(async () => {
            const decisions = await readDecisions(decisionsFile);
            if (status) decisions[id] = status;
            else delete decisions[id];
            await writeDecisions(decisionsFile, decisions);
        });
        writes = write.catch(() => {});
        await write;
        send(res, 200, { id, status });
    }

    return async function photoEditor(req, res, next) {
        let pathname;
        try {
            pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
        } catch {
            return next();
        }
        try {
            if (pathname === API_PATH && req.method === "GET") return send(res, 200, await readDecisions(decisionsFile));
            if (pathname === API_PATH && req.method === "POST") return await decide(req, res);
        } catch {
            return send(res, 500, { error: "Could not save the decision" });
        }
        if (pathname === API_PATH) return send(res, 405, { error: "Method not allowed" });
        if (pathname.startsWith("/backfill/thumbs/")) return serveFile(res, next, thumbsDir, pathname.slice("/backfill/thumbs/".length));
        if (pathname.startsWith("/backfill/")) return serveFile(res, next, candidatesDir, pathname.slice("/backfill/".length));
        return next();
    };
}
