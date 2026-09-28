"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownUp, CheckCircle2 } from "lucide-react";
import { useHistory } from "@/hooks/use-local-store";
import type { ChapterSummary, Locale } from "@/lib/types";

interface Props {
  lang: Locale;
  slug: string;
  chapters: ChapterSummary[];
  labels: {
    chapter: string;
    filter: string;
    newest: string;
    oldest: string;
    empty: string;
    otherLanguage: string;
  };
}

export function ChapterList({ lang, slug, chapters, labels }: Props) {
  const [query, setQuery] = useState("");
  const [asc, setAsc] = useState(false);
  const [history] = useHistory();
  const lastRead = history.find((h) => h.slug === slug)?.chapter;

  // Show chapters in the reader's language; fall back to other languages.
  const inLang = chapters.filter((c) => c.lang === lang);
  const fallback = inLang.length === 0;
  const source = fallback ? chapters : inLang;

  const list = useMemo(() => {
    const seen = new Set<number>();
    const unique = source.filter((c) => (seen.has(c.number) ? false : (seen.add(c.number), true)));
    const q = query.trim();
    const filtered = q ? unique.filter((c) => String(c.number).includes(q)) : unique;
    return [...filtered].sort((a, b) => (asc ? a.number - b.number : b.number - a.number));
  }, [source, query, asc]);

  const dateFmt = new Intl.DateTimeFormat(lang === "id" ? "id-ID" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (chapters.length === 0) return <p className="text-muted">{labels.empty}</p>;

  return (
    <div className="space-y-3">
      {fallback && (
        <p className="rounded-xl bg-accent/10 px-3 py-2 text-sm text-accent">{labels.otherLanguage}</p>
      )}
      <div className="flex gap-2">
        <input
          inputMode="numeric"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={labels.filter}
          className="h-11 flex-1 rounded-xl border border-border bg-surface px-3 text-sm outline-none transition focus:border-primary"
        />
        <button
          type="button"
          onClick={() => setAsc((v) => !v)}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-medium transition hover:border-primary/50"
        >
          <ArrowDownUp className="size-4" />
          {asc ? labels.oldest : labels.newest}
        </button>
      </div>
      <ul className="grid max-h-[480px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
        {list.map((c) => {
          const read = lastRead != null && c.number <= lastRead;
          return (
            <li key={`${c.lang}-${c.number}`}>
              <Link
                href={`/${lang}/comic/${slug}/${c.number}`}
                prefetch={false}
                className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-3 transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                  {c.number}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold group-hover:text-primary">
                    {labels.chapter} {c.number}
                    {c.title ? ` — ${c.title}` : ""}
                  </span>
                  <span className="block text-xs text-muted">
                    {dateFmt.format(new Date(c.publishedAt))}
                    {fallback ? ` · ${c.lang.toUpperCase()}` : ""}
                  </span>
                </span>
                {read && <CheckCircle2 className="size-4 shrink-0 text-accent" aria-label="read" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
