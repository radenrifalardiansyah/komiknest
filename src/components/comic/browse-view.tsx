"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { ComicCardClient } from "./comic-card-client";
import type { ComicCard, Genre, Locale } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  lang: Locale;
  comics: ComicCard[];
  genres: readonly Genre[];
  genreLabels: Record<Genre, string>;
  chapterLabel: string;
  labels: { all: string; sortLatest: string; sortTitle: string; results: string; empty: string };
}

/** Client-side filtering over the (small, cached) card list: no extra requests. */
export function BrowseView({ lang, comics, genres, genreLabels, chapterLabel, labels }: Props) {
  const [genre, setGenre] = useState<Genre | null>(null);
  const [sort, setSort] = useState<"latest" | "title">("latest");
  const [status, setStatus] = useState<"all" | "ongoing" | "completed">("all");

  const list = useMemo(() => {
    const title = (c: ComicCard) => (lang === "en" && c.titleEn ? c.titleEn : c.title);
    return comics
      .filter((c) => !genre || c.genres.includes(genre))
      .filter((c) => status === "all" || c.status === status)
      .sort((a, b) => (sort === "title" ? title(a).localeCompare(title(b)) : b.updatedAt.localeCompare(a.updatedAt)));
  }, [comics, genre, sort, status, lang]);

  const chip = (active: boolean) =>
    cn(
      "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition",
      active ? "border-primary bg-primary text-primary-fg shadow-md shadow-primary/30" : "border-border bg-surface hover:border-primary/50",
    );

  return (
    <div className="space-y-6">
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
        <button type="button" className={chip(genre === null)} onClick={() => setGenre(null)}>
          {labels.all}
        </button>
        {genres.map((g) => (
          <button key={g} type="button" className={chip(genre === g)} onClick={() => setGenre(g)}>
            {genreLabels[g]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          <span className="font-bold text-fg">{list.length}</span> {labels.results}
        </p>
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="h-10 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
          >
            <option value="all">{labels.all}</option>
            <option value="ongoing">{lang === "id" ? "Berlanjut" : "Ongoing"}</option>
            <option value="completed">{lang === "id" ? "Tamat" : "Completed"}</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="h-10 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
          >
            <option value="latest">{labels.sortLatest}</option>
            <option value="title">{labels.sortTitle}</option>
          </select>
        </div>
      </div>

      {list.length === 0 ? (
        <p className="py-16 text-center text-muted">{labels.empty}</p>
      ) : (
        <motion.div layout className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {list.map((c) => (
            <motion.div key={c.slug} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
              <ComicCardClient comic={c} lang={lang} genreLabels={genreLabels} chapterLabel={chapterLabel} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
