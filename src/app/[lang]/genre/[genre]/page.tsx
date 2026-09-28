import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ComicGrid } from "@/components/comic/comic-card";
import { getByGenre } from "@/lib/data";
import { getDictionary, hasLocale } from "@/lib/i18n";
import { GENRES, LOCALES, type Genre } from "@/lib/types";
import { cn } from "@/lib/utils";

export const revalidate = 3600;
export const dynamicParams = false;

export const generateStaticParams = () =>
  LOCALES.flatMap((lang) => GENRES.map((genre) => ({ lang, genre })));

const isGenre = (g: string): g is Genre => (GENRES as readonly string[]).includes(g);

export async function generateMetadata({ params }: PageProps<"/[lang]/genre/[genre]">): Promise<Metadata> {
  const { lang, genre } = await params;
  if (!hasLocale(lang) || !isGenre(genre)) return {};
  return {
    title: getDictionary(lang).genres[genre],
    alternates: { canonical: `/${lang}/genre/${genre}` },
  };
}

export default async function GenrePage({ params }: PageProps<"/[lang]/genre/[genre]">) {
  const { lang, genre } = await params;
  if (!hasLocale(lang) || !isGenre(genre)) notFound();
  const dict = getDictionary(lang);
  const comics = await getByGenre(genre);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6">
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
        {GENRES.map((g) => (
          <Link
            key={g}
            href={`/${lang}/genre/${g}`}
            prefetch={false}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition",
              g === genre
                ? "border-primary bg-primary text-primary-fg shadow-md shadow-primary/30"
                : "border-border bg-surface hover:border-primary/50",
            )}
          >
            {dict.genres[g]}
          </Link>
        ))}
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{dict.genres[genre]}</h1>
      {comics.length ? (
        <ComicGrid comics={comics} lang={lang} dict={dict} />
      ) : (
        <p className="py-16 text-center text-muted">{dict.browse.empty}</p>
      )}
    </div>
  );
}
