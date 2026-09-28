"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ChevronLeft, ChevronRight, Columns2, Rows3, Settings2 } from "lucide-react";
import { AdSlot } from "@/components/ui/ad-slot";
import { recordHistory, useReaderPrefs, type LibraryComic } from "@/hooks/use-local-store";
import type { Chapter, ComicFormat, Locale } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  lang: Locale;
  comic: LibraryComic;
  format: ComicFormat;
  chapter: Chapter;
  numbers: number[];
  prev: number | null;
  next: number | null;
  adSlot?: string;
  labels: {
    prev: string;
    next: string;
    chapters: string;
    settings: string;
    modeVertical: string;
    modePaged: string;
    width: string;
    page: string;
    of: string;
    end: string;
    backToComic: string;
    fallbackLang: string;
    chapter: string;
    ad: string;
  };
}

const WIDTHS = [600, 800, 1000, 1400];

export function Reader({ lang, comic, format, chapter, numbers, prev, next, adSlot, labels }: Props) {
  const router = useRouter();
  const [prefs, setPrefs] = useReaderPrefs();
  const [chrome, setChrome] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [page, setPage] = useState(0);
  const lastY = useRef(0);

  // Paged comics default to single-page mode until the reader picks one.
  const mode = prefs.mode ?? (format === "page" ? "paged" : "vertical");
  const base = `/${lang}/comic/${comic.slug}`;
  const total = chapter.images.length;
  const title = lang === "en" && comic.titleEn ? comic.titleEn : comic.title;

  useEffect(() => {
    recordHistory({ ...comic, chapter: chapter.number, lang: chapter.lang });
  }, [comic, chapter.number, chapter.lang]);

  // Auto-hide toolbars while scrolling down; show on scroll up.
  useEffect(() => {
    if (mode !== "vertical") return;
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, y / max) : 0);
      if (Math.abs(y - lastY.current) > 12) {
        setChrome(y < lastY.current || y < 80);
        lastY.current = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mode]);

  const goPage = useCallback(
    (d: number) => {
      setPage((p) => {
        const n = p + d;
        if (n < 0) {
          if (prev != null) router.push(`${base}/${prev}`);
          return p;
        }
        if (n >= total) {
          if (next != null) router.push(`${base}/${next}`);
          return p;
        }
        window.scrollTo({ top: 0 });
        return n;
      });
    },
    [base, next, prev, router, total],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (mode === "paged") {
        if (e.key === "ArrowRight" || e.key === "d") goPage(1);
        if (e.key === "ArrowLeft" || e.key === "a") goPage(-1);
      } else {
        if (e.key === "ArrowRight" && next != null) router.push(`${base}/${next}`);
        if (e.key === "ArrowLeft" && prev != null) router.push(`${base}/${prev}`);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, goPage, next, prev, router, base]);

  // In paged mode, warm the next two pages only (not the whole chapter).
  useEffect(() => {
    if (mode !== "paged") return;
    chapter.images.slice(page + 1, page + 3).forEach((src) => {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
    });
  }, [mode, page, chapter.images]);

  const pagedProgress = total ? (page + 1) / total : 0;

  return (
    <div className="relative -mb-20 bg-neutral-950 text-white">
      {/* Top bar */}
      <AnimatePresence>
        {chrome && (
          <motion.div
            initial={{ y: -64, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -64, opacity: 0 }}
            className="fixed inset-x-0 top-0 z-[60] border-b border-white/10 bg-neutral-950/85 backdrop-blur-lg"
          >
            <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-3">
              <Link href={base} className="grid size-10 place-items-center rounded-xl hover:bg-white/10" aria-label={labels.backToComic}>
                <ArrowLeft className="size-5" />
              </Link>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{title}</p>
                <p className="truncate text-xs text-white/60">
                  {labels.chapter} {chapter.number}
                  {chapter.title ? ` — ${chapter.title}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen((v) => !v)}
                className="grid size-10 place-items-center rounded-xl hover:bg-white/10"
                aria-label={labels.settings}
                aria-expanded={settingsOpen}
              >
                <Settings2 className="size-5" />
              </button>
            </div>
            <div className="h-0.5 bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-[width] duration-150"
                style={{ width: `${(mode === "paged" ? pagedProgress : progress) * 100}%` }}
              />
            </div>

            <AnimatePresence>
              {settingsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-white/10"
                >
                  <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-4 py-3 text-sm">
                    <div className="flex rounded-xl bg-white/10 p-1">
                      {(
                        [
                          ["vertical", labels.modeVertical, Rows3],
                          ["paged", labels.modePaged, Columns2],
                        ] as const
                      ).map(([m, label, Icon]) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPrefs((p) => ({ ...p, mode: m }))}
                          className={cn(
                            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition",
                            mode === m ? "bg-blue-600 text-white" : "text-white/70 hover:text-white",
                          )}
                        >
                          <Icon className="size-4" />
                          {label}
                        </button>
                      ))}
                    </div>
                    {mode === "vertical" && (
                      <label className="flex items-center gap-2">
                        <span className="text-white/70">{labels.width}</span>
                        <select
                          value={prefs.width}
                          onChange={(e) => setPrefs((p) => ({ ...p, width: Number(e.target.value) }))}
                          className="rounded-lg bg-white/10 px-2 py-1.5 outline-none"
                        >
                          {WIDTHS.map((w) => (
                            <option key={w} value={w} className="bg-neutral-900">
                              {w}px
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                    <label className="flex items-center gap-2">
                      <span className="text-white/70">{labels.chapters}</span>
                      <select
                        value={chapter.number}
                        onChange={(e) => router.push(`${base}/${e.target.value}`)}
                        className="rounded-lg bg-white/10 px-2 py-1.5 outline-none"
                      >
                        {numbers.map((n) => (
                          <option key={n} value={n} className="bg-neutral-900">
                            {labels.chapter} {n}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {chapter.lang !== lang && (
        <p className="relative z-10 mx-auto max-w-3xl px-4 pt-20 text-center text-sm text-cyan-300">{labels.fallbackLang}</p>
      )}

      {/* Pages */}
      {mode === "vertical" ? (
        <div
          className="mx-auto flex flex-col pt-14"
          style={{ maxWidth: prefs.width }}
          onClick={() => setChrome((v) => !v)}
        >
          {chapter.images.map((src, i) => (
            // Plain <img>: served directly from the image origin, never through the app server.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt={`${labels.page} ${i + 1}`}
              loading={i < 2 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "auto"}
              decoding="async"
              className="block w-full select-none bg-neutral-900"
              style={{ aspectRatio: format === "webtoon" ? "800 / 1280" : "800 / 1200" }}
              draggable={false}
            />
          ))}
        </div>
      ) : (
        <div className="relative flex min-h-dvh items-center justify-center pt-14">
          <button
            type="button"
            className="absolute inset-y-0 left-0 z-10 w-1/3 cursor-w-resize"
            onClick={() => goPage(-1)}
            aria-label={labels.prev}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 z-10 w-1/3 cursor-e-resize"
            onClick={() => goPage(1)}
            aria-label={labels.next}
          />
          <button
            type="button"
            className="absolute inset-y-0 left-1/3 z-10 w-1/3"
            onClick={() => setChrome((v) => !v)}
            aria-label={labels.settings}
          />
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={page}
              src={chapter.images[page]}
              alt={`${labels.page} ${page + 1}`}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.18 }}
              className="max-h-[calc(100dvh-4rem)] w-auto max-w-full select-none object-contain"
              draggable={false}
            />
          </AnimatePresence>
          <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold backdrop-blur">
            {labels.page} {page + 1} {labels.of} {total}
          </p>
        </div>
      )}

      {/* End of chapter */}
      <div className="mx-auto max-w-3xl space-y-6 px-4 pb-32 pt-10 text-center">
        {mode === "vertical" && <p className="text-white/70">{labels.end}</p>}
        <AdSlot slot={adSlot} label={labels.ad} />
        <div className="flex items-center justify-center gap-3">
          <ChapterNav href={prev != null ? `${base}/${prev}` : null} dir="prev" label={labels.prev} />
          <ChapterNav href={next != null ? `${base}/${next}` : null} dir="next" label={labels.next} />
        </div>
        <Link href={base} className="inline-block text-sm text-white/60 hover:text-white">
          {labels.backToComic}
        </Link>
      </div>

      {/* Bottom bar (vertical mode) */}
      <AnimatePresence>
        {chrome && mode === "vertical" && (
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            className="fixed inset-x-0 bottom-0 z-[60] pb-[env(safe-area-inset-bottom)]"
          >
            <div className="mx-auto mb-3 flex w-fit items-center gap-1 rounded-2xl border border-white/10 bg-neutral-900/90 p-1.5 shadow-2xl backdrop-blur-lg">
              <ChapterNav href={prev != null ? `${base}/${prev}` : null} dir="prev" label={labels.prev} compact />
              <span className="px-3 text-sm font-semibold tabular-nums">
                {chapter.number} / {numbers[numbers.length - 1]}
              </span>
              <ChapterNav href={next != null ? `${base}/${next}` : null} dir="next" label={labels.next} compact />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChapterNav({
  href,
  dir,
  label,
  compact,
}: {
  href: string | null;
  dir: "prev" | "next";
  label: string;
  compact?: boolean;
}) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  const cls = cn(
    "inline-flex items-center gap-1.5 rounded-xl font-semibold transition",
    compact ? "h-10 px-3 text-sm" : "h-12 px-5",
    href ? "bg-blue-600 text-white hover:bg-blue-500" : "pointer-events-none bg-white/5 text-white/30",
  );
  const content = (
    <>
      {dir === "prev" && <Icon className="size-4" />}
      <span className={compact ? "sr-only sm:not-sr-only" : ""}>{label}</span>
      {dir === "next" && <Icon className="size-4" />}
    </>
  );
  return href ? (
    <Link href={href} className={cls}>
      {content}
    </Link>
  ) : (
    <span aria-disabled className={cls}>
      {content}
    </span>
  );
}
