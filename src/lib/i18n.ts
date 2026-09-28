import id from "@/dictionaries/id.json";
import en from "@/dictionaries/en.json";
import { LOCALES, type Comic, type ComicCard, type Locale } from "./types";

export type Dictionary = typeof id;

// Both dictionaries are tiny, so a static map is simpler than dynamic imports
// and lets client components receive the slice they need as props.
const dictionaries: Record<Locale, Dictionary> = { id, en };

export const hasLocale = (v: string): v is Locale => (LOCALES as readonly string[]).includes(v);
export const getDictionary = (locale: Locale) => dictionaries[locale];

export const comicTitle = (c: Pick<ComicCard, "title" | "titleEn">, locale: Locale) =>
  locale === "en" && c.titleEn ? c.titleEn : c.title;

export const comicSynopsis = (c: Pick<Comic, "synopsis">, locale: Locale) =>
  c.synopsis[locale] ?? c.synopsis.id ?? c.synopsis.en ?? "";

export function formatDate(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
