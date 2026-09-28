"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Download, Trash2, Upload, X } from "lucide-react";
import { useBookmarks, useHistory, type Bookmark, type HistoryEntry } from "@/hooks/use-local-store";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  lang: Locale;
  labels: {
    bookmarks: string;
    history: string;
    emptyBookmarks: string;
    emptyHistory: string;
    clear: string;
    export: string;
    import: string;
    localNote: string;
    chapter: string;
  };
}

export function LibraryView({ lang, labels }: Props) {
  const [tab, setTab] = useState<"bookmarks" | "history">("bookmarks");
  const [bookmarks, setBookmarks] = useBookmarks();
  const [history, setHistory] = useHistory();
  const fileRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ v: 1, bookmarks, history }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "komiknest-library.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importData = async (file: File) => {
    try {
      const data = JSON.parse(await file.text()) as { bookmarks?: Bookmark[]; history?: HistoryEntry[] };
      const merge = <T extends { slug: string }>(a: T[], b: T[] = []) => {
        const seen = new Set(a.map((x) => x.slug));
        return [...a, ...b.filter((x) => typeof x?.slug === "string" && !seen.has(x.slug))];
      };
      setBookmarks((prev) => merge(prev, data.bookmarks));
      setHistory((prev) => merge(prev, data.history));
    } catch {
      // invalid file: ignore
    }
  };

  const title = (c: { title: string; titleEn: string | null }) => (lang === "en" && c.titleEn ? c.titleEn : c.title);
  const items = tab === "bookmarks" ? bookmarks : history;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex rounded-2xl border border-border bg-surface p-1">
          {(["bookmarks", "history"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn("relative rounded-xl px-4 py-2 text-sm font-semibold transition", tab === t ? "text-primary-fg" : "text-muted hover:text-fg")}
            >
              {tab === t && (
                <motion.span layoutId="lib-tab" className="absolute inset-0 -z-0 rounded-xl bg-primary" transition={{ type: "spring", stiffness: 500, damping: 36 }} />
              )}
              <span className="relative">
                {labels[t]} <span className="opacity-70">({(t === "bookmarks" ? bookmarks : history).length})</span>
              </span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={exportData} className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-medium hover:border-primary/50">
            <Download className="size-4" /> {labels.export}
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-medium hover:border-primary/50">
            <Upload className="size-4" /> {labels.import}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importData(f);
              e.target.value = "";
            }}
          />
          {tab === "history" && history.length > 0 && (
            <button type="button" onClick={() => setHistory([])} className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-medium text-red-500 hover:border-red-400">
              <Trash2 className="size-4" /> {labels.clear}
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-muted">{labels.localNote}</p>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-muted">
          {tab === "bookmarks" ? labels.emptyBookmarks : labels.emptyHistory}
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          <AnimatePresence>
            {items.map((c) => (
              <motion.li key={c.slug} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="group relative">
                <Link
                  href={"chapter" in c ? `/${lang}/comic/${c.slug}/${c.chapter}` : `/${lang}/comic/${c.slug}`}
                  prefetch={false}
                  className="block"
                >
                  <div className="overflow-hidden rounded-2xl ring-1 ring-border transition group-hover:shadow-xl group-hover:shadow-primary/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.cover} alt={title(c)} loading="lazy" className="aspect-[2/3] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm font-semibold group-hover:text-primary">{title(c)}</p>
                  {"chapter" in c && (
                    <p className="text-xs text-muted">
                      {labels.chapter} {c.chapter}
                    </p>
                  )}
                </Link>
                {tab === "bookmarks" && (
                  <button
                    type="button"
                    aria-label="Remove"
                    onClick={() => setBookmarks((prev) => prev.filter((b) => b.slug !== c.slug))}
                    className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur transition group-hover:opacity-100 focus:opacity-100"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
