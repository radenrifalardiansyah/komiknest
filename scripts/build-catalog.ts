/**
 * Bundles content/comics/*.json into src/generated/catalog.json.
 * The app reads this file when Supabase is not configured ("local mode"),
 * so the site works with zero external services.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadContent } from "./content-schema";

const comics = loadContent();
const out = join(process.cwd(), "src", "generated");
mkdirSync(out, { recursive: true });
writeFileSync(join(out, "catalog.json"), JSON.stringify(comics));
console.log(`catalog: ${comics.length} comics, ${comics.reduce((n, c) => n + c.chapters.length, 0)} chapters`);
