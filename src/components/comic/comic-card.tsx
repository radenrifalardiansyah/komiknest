import type { Dictionary } from "@/lib/i18n";
import type { ComicCard as Card, Locale } from "@/lib/types";
import { ComicCardClient } from "./comic-card-client";

interface ListProps {
  comics: Card[];
  lang: Locale;
  dict: Dictionary;
}

export function ComicGrid({ comics, lang, dict }: ListProps) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {comics.map((c, i) => (
        <ComicCardClient
          key={c.slug}
          comic={c}
          lang={lang}
          genreLabels={dict.genres}
          chapterLabel={dict.comic.chapter}
          priority={i < 6}
        />
      ))}
    </div>
  );
}

export function ComicRail({ comics, lang, dict }: ListProps) {
  return (
    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
      {comics.map((c) => (
        <div key={c.slug} className="w-36 shrink-0 snap-start sm:w-44">
          <ComicCardClient comic={c} lang={lang} genreLabels={dict.genres} chapterLabel={dict.comic.chapter} />
        </div>
      ))}
    </div>
  );
}
