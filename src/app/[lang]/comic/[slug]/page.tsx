import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Book3D } from "@/components/comic/book-3d";
import { ChapterList } from "@/components/comic/chapter-list";
import { ComicActions } from "@/components/comic/comic-actions";
import { AdSlot } from "@/components/ui/ad-slot";
import { getComic } from "@/lib/data";
import { comicSynopsis, comicTitle, getDictionary, hasLocale, siteUrl } from "@/lib/i18n";

export const revalidate = 21600;

// Rendered on first visit, then cached (ISR). Nothing is prebuilt, so build
// time and cache writes stay flat no matter how large the catalog grows.
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/[lang]/comic/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const data = await getComic(slug);
  if (!data) return {};
  const title = comicTitle(data.comic, lang);
  const description = comicSynopsis(data.comic, lang).slice(0, 160);
  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/comic/${slug}`,
      languages: { id: `/id/comic/${slug}`, en: `/en/comic/${slug}` },
    },
    openGraph: { title, description, images: [{ url: data.comic.coverUrl }], type: "book" },
  };
}

export default async function ComicPage({ params }: PageProps<"/[lang]/comic/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const data = await getComic(slug);
  if (!data) notFound();
  const { comic, chapters } = data;
  const dict = getDictionary(lang);
  const title = comicTitle(comic, lang);
  const synopsis = comicSynopsis(comic, lang);

  const inLang = chapters.filter((c) => c.lang === lang);
  const pool = inLang.length ? inLang : chapters;
  const firstChapter = pool.length ? Math.min(...pool.map((c) => c.number)) : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ComicSeries",
    name: title,
    url: `${siteUrl}/${lang}/comic/${slug}`,
    image: comic.coverUrl.startsWith("/") ? siteUrl + comic.coverUrl : comic.coverUrl,
    description: synopsis,
    author: comic.author ? { "@type": "Person", name: comic.author } : undefined,
    genre: comic.genres.map((g) => dict.genres[g]),
    inLanguage: comic.languages,
    license: comic.license,
  };

  const facts: [string, React.ReactNode][] = [
    [dict.comic.author, comic.author ?? "—"],
    [dict.comic.artist, comic.artist ?? "—"],
    [dict.comic.status, dict.comic[`status_${comic.status}`]],
    [dict.comic.format, dict.comic[`format_${comic.format}`]],
    [dict.comic.languages, comic.languages.map((l) => l.toUpperCase()).join(" · ")],
    [dict.comic.license, comic.license],
    [
      dict.comic.source,
      comic.sourceUrl ? (
        <a href={comic.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          {comic.sourceName ?? comic.sourceUrl}
        </a>
      ) : (
        (comic.sourceName ?? "—")
      ),
    ],
  ];

  return (
    <article className="relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Blurred cover backdrop */}
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[420px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={comic.coverUrl} alt="" className="size-full scale-110 object-cover opacity-40 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg/70 to-bg" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 md:pt-14">
        <div className="grid gap-8 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] lg:gap-12">
          <div className="mx-auto w-52 sm:w-60 md:w-full">
            <Book3D cover={comic.coverUrl} title={title} />
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {comic.genres.map((g) => (
                  <Link
                    key={g}
                    href={`/${lang}/genre/${g}`}
                    prefetch={false}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition hover:bg-primary hover:text-primary-fg"
                  >
                    {dict.genres[g]}
                  </Link>
                ))}
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">{title}</h1>
              {lang === "en" ? (
                comic.title !== title && <p className="text-muted">{comic.title}</p>
              ) : (
                comic.titleEn && <p className="text-muted">{comic.titleEn}</p>
              )}
            </div>

            <ComicActions
              lang={lang}
              firstChapter={firstChapter}
              comic={{ slug, title: comic.title, titleEn: comic.titleEn, cover: comic.coverUrl }}
              labels={{
                read: dict.comic.read,
                continue: dict.comic.continue,
                bookmark: dict.comic.bookmark,
                bookmarked: dict.comic.bookmarked,
              }}
            />

            <section>
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-muted">{dict.comic.synopsis}</h2>
              <p className="max-w-2xl leading-relaxed">{synopsis}</p>
            </section>

            <dl className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-surface/80 p-4 text-sm backdrop-blur sm:grid-cols-3">
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-muted">{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_COMIC} label={dict.common.ad} className="mt-10" />

        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold tracking-tight sm:text-2xl">{dict.comic.chapters}</h2>
          <ChapterList
            lang={lang}
            slug={slug}
            chapters={chapters}
            labels={{
              chapter: dict.comic.chapter,
              filter: dict.comic.filterChapters,
              newest: dict.comic.sortNewest,
              oldest: dict.comic.sortOldest,
              empty: dict.comic.noChapters,
              otherLanguage: dict.comic.otherLanguage,
            }}
          />
        </section>
      </div>
    </article>
  );
}
