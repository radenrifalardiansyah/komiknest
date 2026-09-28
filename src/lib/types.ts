export const LOCALES = ["id", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "id";

export const GENRES = [
  "action",
  "adventure",
  "comedy",
  "drama",
  "fantasy",
  "sci-fi",
  "slice-of-life",
  "mystery",
  "romance",
  "horror",
  "history",
  "kids",
] as const;
export type Genre = (typeof GENRES)[number];

export type ComicStatus = "ongoing" | "completed" | "hiatus";
export type ComicFormat = "webtoon" | "page";
export type Localized = Partial<Record<Locale, string>>;

/** Everything needed to render a card in a grid. */
export interface ComicCard {
  slug: string;
  title: string;
  titleEn: string | null;
  coverUrl: string;
  genres: Genre[];
  status: ComicStatus;
  format: ComicFormat;
  languages: Locale[];
  featured: boolean;
  updatedAt: string;
  latestChapter: number | null;
}

export interface Comic extends ComicCard {
  author: string | null;
  artist: string | null;
  synopsis: Localized;
  license: string;
  sourceName: string | null;
  sourceUrl: string | null;
}

export interface ChapterSummary {
  number: number;
  lang: Locale;
  title: string | null;
  publishedAt: string;
}

export interface Chapter extends ChapterSummary {
  comicSlug: string;
  /** Absolute or root-relative URLs, already joined with image_base. */
  images: string[];
}

export interface SearchEntry {
  s: string; // slug
  t: string; // title
  e: string | null; // english title
  c: string; // cover
  g: Genre[];
}
