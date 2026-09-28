import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reader } from "@/components/reader/reader";
import { getChapter, getComic } from "@/lib/data";
import { comicTitle, getDictionary, hasLocale } from "@/lib/i18n";
import { LOCALES, type Locale } from "@/lib/types";

export const revalidate = 86400;

export async function generateStaticParams() {
  return [];
}

async function load(lang: string, slug: string, chapterParam: string) {
  if (!hasLocale(lang)) return null;
  const number = Number(chapterParam);
  if (!Number.isFinite(number) || number <= 0) return null;
  const data = await getComic(slug);
  if (!data) return null;

  // Prefer the reader's language; otherwise show whichever language exists.
  const order: Locale[] = [lang, ...LOCALES.filter((l) => l !== lang)];
  const chapterLang = order.find((l) => data.chapters.some((c) => c.lang === l && c.number === number));
  if (!chapterLang) return null;
  const chapter = await getChapter(slug, chapterLang, number);
  if (!chapter) return null;

  const numbers = [...new Set(data.chapters.filter((c) => c.lang === chapterLang).map((c) => c.number))].sort(
    (a, b) => a - b,
  );
  const i = numbers.indexOf(number);
  return {
    lang,
    data,
    chapter,
    numbers,
    prev: i > 0 ? numbers[i - 1] : null,
    next: i < numbers.length - 1 ? numbers[i + 1] : null,
  };
}

export async function generateMetadata({ params }: PageProps<"/[lang]/comic/[slug]/[chapter]">): Promise<Metadata> {
  const { lang, slug, chapter } = await params;
  const r = await load(lang, slug, chapter);
  if (!r) return {};
  const dict = getDictionary(r.lang);
  const title = `${comicTitle(r.data.comic, r.lang)} — ${dict.comic.chapter} ${r.chapter.number}`;
  return {
    title,
    alternates: {
      canonical: `/${lang}/comic/${slug}/${chapter}`,
      languages: { id: `/id/comic/${slug}/${chapter}`, en: `/en/comic/${slug}/${chapter}` },
    },
    openGraph: { title, images: [{ url: r.data.comic.coverUrl }] },
  };
}

export default async function ChapterPage({ params }: PageProps<"/[lang]/comic/[slug]/[chapter]">) {
  const { lang, slug, chapter } = await params;
  const r = await load(lang, slug, chapter);
  if (!r) notFound();
  const dict = getDictionary(r.lang);
  const { comic } = r.data;

  return (
    <Reader
      lang={r.lang}
      comic={{ slug, title: comic.title, titleEn: comic.titleEn, cover: comic.coverUrl }}
      format={comic.format}
      chapter={r.chapter}
      numbers={r.numbers}
      prev={r.prev}
      next={r.next}
      adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_READER}
      labels={{ ...dict.reader, chapter: dict.comic.chapter, ad: dict.common.ad }}
    />
  );
}
