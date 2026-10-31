#!/usr/bin/env node
// Put the photos marked ✅ in the map editor on the site's maps. Run after selecting:
//   npm run trail:keepers
import path from "node:path";
import { fileURLToPath } from "node:url";
import { publishKeepers } from "./trail/keepers.js";
import { readDecisions, CANDIDATES_DIR } from "./trail/photo-editor.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const published = await publishKeepers(root, await readDecisions(), CANDIDATES_DIR);
published.forEach((src) => console.log(src));
console.log(`Published ${published.length} photos`);
