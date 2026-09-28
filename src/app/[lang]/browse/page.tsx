import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BrowseView } from "@/components/comic/browse-view";
import { getAllCards } from "@/lib/data";
import { getDictionary, hasLocale } from "@/lib/i18n";
import { GENRES } from "@/lib/types";

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<"/[lang]/browse">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { title: getDictionary(lang).browse.title, alternates: { canonical: `/${lang}/browse` } };
}

export default async function BrowsePage({ params }: PageProps<"/[lang]/browse">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const comics = await getAllCards();

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{dict.browse.title}</h1>
      <BrowseView
        lang={lang}
        comics={comics}
        genres={GENRES}
        genreLabels={dict.genres}
        chapterLabel={dict.comic.chapter}
        labels={{
          all: dict.browse.all,
          sortLatest: dict.browse.sortLatest,
          sortTitle: dict.browse.sortTitle,
          results: dict.browse.results,
          empty: dict.browse.empty,
        }}
      />
    </div>
  );
}
