import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { GENRES, LOCALES } from "../src/lib/types";

/**
 * Schema for a comic in content/comics/*.json.
 * `license` is required: only publish content you own, content in the public
 * domain, or content whose license allows redistribution.
 */
export const ChapterSchema = z.object({
  number: z.number().positive(),
  lang: z.enum(LOCALES),
  title: z.string().nullable().default(null),
  publishedAt: z.iso.datetime(),
  imageBase: z.string().default(""),
  images: z.array(z.string().min(1)).min(1),
});

export const ComicSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  title: z.string().min(1),
  titleEn: z.string().nullable().default(null),
  author: z.string().nullable().default(null),
  artist: z.string().nullable().default(null),
  cover: z.string().min(1),
  synopsis: z.object({ id: z.string().optional(), en: z.string().optional() }),
  genres: z.array(z.enum(GENRES)).min(1),
  status: z.enum(["ongoing", "completed", "hiatus"]),
  format: z.enum(["webtoon", "page"]),
  featured: z.boolean().default(false),
  license: z.string().min(2),
  sourceName: z.string().nullable().default(null),
  sourceUrl: z.url().nullable().default(null),
  chapters: z.array(ChapterSchema),
});

export type ContentComic = z.infer<typeof ComicSchema>;

export function loadContent(dir = join(process.cwd(), "content", "comics")) {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => {
      const parsed = ComicSchema.safeParse(JSON.parse(readFileSync(join(dir, f), "utf8")));
      if (!parsed.success) {
        throw new Error(`content/comics/${f}: ${z.prettifyError(parsed.error)}`);
      }
      return parsed.data;
    });
}
