import Link from "next/link";
import type { ComicCard, Genre, Locale } from "@/lib/types";
import { TiltCard } from "./tilt-card";

interface Props {
  comic: ComicCard;
  lang: Locale;
  genreLabels: Record<Genre, string>;
  chapterLabel: string;
  priority?: boolean;
}

/** Pure presentational card, usable from both server and client components. */
export function ComicCardClient({ comic, lang, genreLabels, chapterLabel, priority }: Props) {
  const title = lang === "en" && comic.titleEn ? comic.titleEn : comic.title;
  return (
    <Link
      href={`/${lang}/comic/${comic.slug}`}
      // Grids render dozens of links; prefetching all of them would multiply requests.
      prefetch={false}
      className="group block outline-none"
    >
      <TiltCard className="overflow-hidden rounded-2xl bg-surface-2 shadow-md ring-1 ring-border transition-shadow group-hover:shadow-xl group-hover:shadow-primary/20 group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <div className="relative aspect-[2/3]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={comic.coverUrl}
            alt={title}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 to-transparent" />
          {/* Badges sit at the bottom so they never cover the cover's title art. */}
          <div className="absolute inset-x-2 bottom-2 flex items-end justify-between gap-1">
            {comic.latestChapter != null ? (
              <span className="rounded-lg bg-primary px-2 py-1 text-[11px] font-bold text-primary-fg shadow">
                {chapterLabel} {comic.latestChapter}
              </span>
            ) : (
              <span />
            )}
            <span className="flex gap-1">
              {comic.languages.map((l) => (
                <span key={l} className="rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white backdrop-blur">
                  {l}
                </span>
              ))}
            </span>
          </div>
        </div>
      </TiltCard>
      <div className="mt-2.5 px-0.5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-primary">
          {title}
        </h3>
        <p className="mt-0.5 truncate text-xs text-muted">
          {comic.genres
            .slice(0, 2)
            .map((g) => genreLabels[g])
            .join(" · ")}
        </p>
      </div>
    </Link>
  );
}
