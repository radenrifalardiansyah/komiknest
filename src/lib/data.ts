import "server-only";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import catalog from "@/generated/catalog.json";
import type {
  Chapter,
  ChapterSummary,
  Comic,
  ComicCard,
  Genre,
  Locale,
  SearchEntry,
} from "./types";

/**
 * Data access. Two backends:
 *  - Supabase, when SUPABASE_URL + SUPABASE_ANON_KEY are set
 *  - local catalog (src/generated/catalog.json), otherwise
 *
 * Every read is wrapped in unstable_cache with tags, so pages are served from
 * the ISR cache and the database is only hit on (re)generation.
 */

const REVALIDATE = 60 * 60 * 6; // safety net; content changes revalidate by tag

export const tags = {
  all: "comics",
  comic: (slug: string) => `comic:${slug}`,
};

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const db =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })
    : null;

// ---------------------------------------------------------------- local mode

type CatalogComic = (typeof catalog)[number];
const local = catalog as CatalogComic[];

const joinUrl = (base: string, file: string) =>
  /^https?:\/\//.test(file) || file.startsWith("/") ? file : base + file;

function localCard(c: CatalogComic): ComicCard {
  const latest = c.chapters.reduce<CatalogComic["chapters"][number] | null>(
    (a, ch) => (!a || ch.publishedAt > a.publishedAt ? ch : a),
    null,
  );
  return {
    slug: c.slug,
    title: c.title,
    titleEn: c.titleEn,
    coverUrl: c.cover,
    genres: c.genres as Genre[],
    status: c.status as Comic["status"],
    format: c.format as Comic["format"],
    languages: [...new Set(c.chapters.map((ch) => ch.lang as Locale))],
    featured: c.featured,
    updatedAt: latest?.publishedAt ?? "1970-01-01T00:00:00.000Z",
    latestChapter: c.chapters.length ? Math.max(...c.chapters.map((ch) => ch.number)) : null,
  };
}

// ---------------------------------------------------------------- supabase mode

interface CardRow {
  slug: string;
  title: string;
  title_en: string | null;
  cover_url: string;
  genres: string[];
  status: Comic["status"];
  format: Comic["format"];
  featured: boolean;
  updated_at: string;
  languages: string[];
  latest_chapter: number | string | null;
}

const CARD_COLS =
  "slug,title,title_en,cover_url,genres,status,format,featured,updated_at,languages,latest_chapter";

function rowCard(r: CardRow): ComicCard {
  return {
    slug: r.slug,
    title: r.title,
    titleEn: r.title_en,
    coverUrl: r.cover_url,
    genres: r.genres as Genre[],
    status: r.status,
    format: r.format,
    languages: r.languages as Locale[],
    featured: r.featured,
    updatedAt: r.updated_at,
    latestChapter: r.latest_chapter == null ? null : Number(r.latest_chapter),
  };
}

async function sbCards(limit = 500) {
  const { data, error } = await db!
    .from("comic_cards")
    .select(CARD_COLS)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as CardRow[]).map(rowCard);
}

// ---------------------------------------------------------------- public API

/** All published comics as cards, newest update first. Small: text only. */
export const getAllCards = unstable_cache(
  async (): Promise<ComicCard[]> => {
    if (db) return sbCards();
    return local.map(localCard).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },
  ["all-cards"],
  { tags: [tags.all], revalidate: REVALIDATE },
);

export async function getLatest(limit = 24) {
  return (await getAllCards()).slice(0, limit);
}

export async function getFeatured() {
  const all = await getAllCards();
  const featured = all.filter((c) => c.featured);
  return featured.length ? featured : all.slice(0, 5);
}

export async function getByGenre(genre: Genre) {
  return (await getAllCards()).filter((c) => c.genres.includes(genre));
}

export async function getSearchIndex(): Promise<SearchEntry[]> {
  return (await getAllCards()).map((c) => ({
    s: c.slug,
    t: c.title,
    e: c.titleEn,
    c: c.coverUrl,
    g: c.genres,
  }));
}

const fetchComic = (slug: string) =>
  unstable_cache(
    async (): Promise<{ comic: Comic; chapters: ChapterSummary[] } | null> => {
      if (db) {
        const { data, error } = await db
          .from("comics")
          .select(
            "slug,title,title_en,author,artist,cover_url,synopsis,genres,status,format,featured,license,source_name,source_url,updated_at,chapters(lang,number,title,published_at)",
          )
          .eq("slug", slug)
          .maybeSingle();
        if (error) throw error;
        if (!data) return null;
        const chapters: ChapterSummary[] = data.chapters
          .map((ch) => ({
            number: Number(ch.number),
            lang: ch.lang as Locale,
            title: ch.title,
            publishedAt: ch.published_at,
          }))
          .sort((a, b) => b.number - a.number);
        return {
          comic: {
            slug: data.slug,
            title: data.title,
            titleEn: data.title_en,
            coverUrl: data.cover_url,
            genres: data.genres as Genre[],
            status: data.status,
            format: data.format,
            languages: [...new Set(chapters.map((c) => c.lang))],
            featured: data.featured,
            updatedAt: data.updated_at,
            latestChapter: chapters[0]?.number ?? null,
            author: data.author,
            artist: data.artist,
            synopsis: data.synopsis ?? {},
            license: data.license,
            sourceName: data.source_name,
            sourceUrl: data.source_url,
          },
          chapters,
        };
      }

      const c = local.find((x) => x.slug === slug);
      if (!c) return null;
      return {
        comic: {
          ...localCard(c),
          author: c.author,
          artist: c.artist,
          synopsis: c.synopsis,
          license: c.license,
          sourceName: c.sourceName,
          sourceUrl: c.sourceUrl,
        },
        chapters: c.chapters
          .map((ch) => ({
            number: ch.number,
            lang: ch.lang as Locale,
            title: ch.title,
            publishedAt: ch.publishedAt,
          }))
          .sort((a, b) => b.number - a.number),
      };
    },
    ["comic", slug],
    { tags: [tags.all, tags.comic(slug)], revalidate: REVALIDATE },
  )();

/** Comic metadata + chapter list (without image URLs). Deduped per request. */
export const getComic = cache(fetchComic);

export const getChapter = cache((slug: string, lang: Locale, number: number) =>
  unstable_cache(
    async (): Promise<Chapter | null> => {
      if (db) {
        const { data, error } = await db
          .from("chapters")
          .select("lang,number,title,published_at,image_base,images,comics!inner(slug)")
          .eq("comics.slug", slug)
          .eq("lang", lang)
          .eq("number", number)
          .maybeSingle();
        if (error) throw error;
        if (!data) return null;
        return {
          comicSlug: slug,
          number: Number(data.number),
          lang: data.lang as Locale,
          title: data.title,
          publishedAt: data.published_at,
          images: data.images.map((f: string) => joinUrl(data.image_base, f)),
        };
      }
      const ch = local
        .find((x) => x.slug === slug)
        ?.chapters.find((x) => x.lang === lang && x.number === number);
      if (!ch) return null;
      return {
        comicSlug: slug,
        number: ch.number,
        lang: ch.lang as Locale,
        title: ch.title,
        publishedAt: ch.publishedAt,
        images: ch.images.map((f) => joinUrl(ch.imageBase, f)),
      };
    },
    ["chapter", slug, lang, String(number)],
    { tags: [tags.all, tags.comic(slug)], revalidate: REVALIDATE },
  )(),
);
