/**
 * Syncs content into Supabase, then asks the site to revalidate only the
 * comics that changed. Runs in GitHub Actions (see .github/workflows/ingest.yml).
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SITE_URL?, REVALIDATE_SECRET?
 *
 * Sources are pluggable adapters. Only add adapters for content you own or
 * that is licensed for redistribution (public domain, CC, publisher permission).
 */
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type { ContentComic } from "../content-schema";
import { localAdapter } from "./local-adapter";

export interface SourceAdapter {
  name: string;
  load(): Promise<ContentComic[]>;
}

const ADAPTERS: SourceAdapter[] = [localAdapter];

function env(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

// Key-order independent: Postgres jsonb reorders object keys.
const canonical = (v: unknown): unknown =>
  Array.isArray(v)
    ? v.map(canonical)
    : v && typeof v === "object"
      ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canonical((v as Record<string, unknown>)[k])]))
      : v;
const hash = (v: unknown) => createHash("sha1").update(JSON.stringify(canonical(v))).digest("hex");

async function main() {
  const db = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false },
  });

  const comics = (await Promise.all(ADAPTERS.map((a) => a.load()))).flat();

  // Existing state, to skip unchanged rows (fewer writes, fewer revalidations).
  const { data: existing, error: exErr } = await db
    .from("comics")
    .select("slug, title, title_en, author, artist, cover_url, synopsis, genres, status, format, featured, license, source_name, source_url, chapters(lang, number, title, image_base, images, published_at)");
  if (exErr) throw exErr;
  const bySlug = new Map(existing.map((c) => [c.slug, c]));

  const changed: string[] = [];

  for (const c of comics) {
    const row = {
      slug: c.slug,
      title: c.title,
      title_en: c.titleEn,
      author: c.author,
      artist: c.artist,
      cover_url: c.cover,
      synopsis: c.synopsis,
      genres: c.genres,
      status: c.status,
      format: c.format,
      featured: c.featured,
      license: c.license,
      source_name: c.sourceName,
      source_url: c.sourceUrl,
    };
    const chapters = c.chapters.map((ch) => ({
      lang: ch.lang,
      number: ch.number,
      title: ch.title,
      image_base: ch.imageBase,
      images: ch.images,
      published_at: ch.publishedAt,
    }));

    const prev = bySlug.get(c.slug);
    if (prev) {
      const { chapters: prevChapters, ...prevRow } = prev;
      const norm = (list: typeof chapters) =>
        [...list]
          .map((ch) => ({ ...ch, number: Number(ch.number), published_at: new Date(ch.published_at).toISOString() }))
          .sort((a, b) => a.lang.localeCompare(b.lang) || a.number - b.number);
      if (hash(prevRow) === hash(row) && hash(norm(prevChapters)) === hash(norm(chapters))) continue;
    }

    const { data: saved, error } = await db
      .from("comics")
      .upsert(row, { onConflict: "slug" })
      .select("id")
      .single();
    if (error) throw error;

    if (chapters.length) {
      const { error: chErr } = await db
        .from("chapters")
        .upsert(
          chapters.map((ch) => ({ ...ch, comic_id: saved.id })),
          { onConflict: "comic_id,lang,number" },
        );
      if (chErr) throw chErr;
    }
    changed.push(c.slug);
    console.log(`upserted ${c.slug} (${chapters.length} chapters)`);
  }

  console.log(`${changed.length} changed / ${comics.length} total`);
  if (changed.length) await revalidate(changed);
}

async function revalidate(slugs: string[]) {
  const site = process.env.SITE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!site || !secret) {
    console.log("SITE_URL/REVALIDATE_SECRET not set; skipping revalidation");
    return;
  }
  const res = await fetch(new URL("/api/revalidate", site), {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${secret}` },
    body: JSON.stringify({ slugs }),
  });
  console.log(`revalidate → ${res.status} ${await res.text()}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
