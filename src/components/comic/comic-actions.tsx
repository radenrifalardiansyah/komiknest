"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { BookOpen, Bookmark, BookmarkCheck } from "lucide-react";
import { useBookmarks, useHistory, type LibraryComic } from "@/hooks/use-local-store";
import type { Locale } from "@/lib/types";

interface Props {
  lang: Locale;
  comic: LibraryComic;
  firstChapter: number | null;
  labels: { read: string; continue: string; bookmark: string; bookmarked: string };
}

export function ComicActions({ lang, comic, firstChapter, labels }: Props) {
  const [bookmarks, setBookmarks] = useBookmarks();
  const [history] = useHistory();
  const saved = bookmarks.some((b) => b.slug === comic.slug);
  const last = history.find((h) => h.slug === comic.slug);

  const toggle = () =>
    setBookmarks((prev) =>
      saved ? prev.filter((b) => b.slug !== comic.slug) : [{ ...comic, addedAt: Date.now() }, ...prev],
    );

  const target = last ? last.chapter : firstChapter;

  return (
    <div className="flex flex-wrap gap-3">
      {target != null && (
        <Link
          href={`/${lang}/comic/${comic.slug}/${target}`}
          className="inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-6 font-semibold text-white shadow-lg shadow-primary/30 transition hover:brightness-110 active:scale-[.98]"
        >
          <BookOpen className="size-5" />
          {last ? `${labels.continue} ${last.chapter}` : labels.read}
        </Link>
      )}
      <motion.button
        type="button"
        onClick={toggle}
        whileTap={{ scale: 0.94 }}
        aria-pressed={saved}
        className={`inline-flex h-12 items-center gap-2 rounded-2xl border px-5 font-semibold transition ${
          saved ? "border-primary bg-primary/10 text-primary" : "border-border bg-surface hover:border-primary/50"
        }`}
      >
        {saved ? <BookmarkCheck className="size-5" /> : <Bookmark className="size-5" />}
        {saved ? labels.bookmarked : labels.bookmark}
      </motion.button>
    </div>
  );
}
