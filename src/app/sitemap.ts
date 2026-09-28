import type { MetadataRoute } from "next";
import { getAllCards } from "@/lib/data";
import { siteUrl } from "@/lib/i18n";
import { GENRES, LOCALES } from "@/lib/types";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const comics = await getAllCards();
  const alt = (path: string) => ({
    languages: Object.fromEntries(LOCALES.map((l) => [l, `${siteUrl}/${l}${path}`])),
  });

  // Comic pages only (not every chapter): keeps crawlers from forcing
  // thousands of ISR regenerations.
  return [
    ...LOCALES.map((l) => ({ url: `${siteUrl}/${l}`, changeFrequency: "daily" as const, priority: 1, alternates: alt("") })),
    ...LOCALES.map((l) => ({ url: `${siteUrl}/${l}/browse`, changeFrequency: "daily" as const, alternates: alt("/browse") })),
    ...LOCALES.flatMap((l) => GENRES.map((g) => ({ url: `${siteUrl}/${l}/genre/${g}`, alternates: alt(`/genre/${g}`) }))),
    ...LOCALES.flatMap((l) =>
      comics.map((c) => ({
        url: `${siteUrl}/${l}/comic/${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
        alternates: alt(`/comic/${c.slug}`),
      })),
    ),
  ];
}
