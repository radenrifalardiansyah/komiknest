"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import type Fuse from "fuse.js";
import { Search, X } from "lucide-react";
import type { Locale, SearchEntry } from "@/lib/types";

interface Props {
  lang: Locale;
  labels: { button: string; placeholder: string; empty: string; hint: string };
  genreLabels: Record<string, string>;
}

const OPEN_EVENT = "kn:open-search";
const noopSubscribe = () => () => {};

/** A button that opens the (single) search dialog. Can be rendered anywhere. */
export function SearchTrigger({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
      className="flex h-10 w-full items-center gap-2 rounded-xl border border-border bg-surface-2/60 px-3 text-sm text-muted transition hover:border-primary/50 hover:text-fg md:w-64"
    >
      <Search className="size-4 shrink-0" />
      <span className="truncate">{label}</span>
      <kbd className="ml-auto hidden rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-semibold md:inline">
        ⌘K
      </kbd>
    </button>
  );
}

let indexPromise: Promise<{ fuse: Fuse<SearchEntry>; list: SearchEntry[] }> | null = null;

/** Search index is one small cached JSON file; searching happens in the browser. */
function loadIndex() {
  indexPromise ??= Promise.all([
    fetch("/api/search-index").then((r) => r.json() as Promise<SearchEntry[]>),
    import("fuse.js"),
  ]).then(([list, { default: FuseCtor }]) => ({
    list,
    fuse: new FuseCtor(list, { keys: ["t", "e", "g"], threshold: 0.35, ignoreLocation: true }),
  }));
  return indexPromise;
}

/** The search dialog. Render exactly once; open it with SearchTrigger, ⌘K or "/". */
export function SearchPalette({ lang, labels, genreLabels }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [data, setData] = useState<Awaited<ReturnType<typeof loadIndex>> | null>(null);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  // Only portal after hydration (server renders nothing here).
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const show = useCallback(() => {
    setOpen(true);
    loadIndex().then(setData);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        show();
      } else if (e.key === "/" && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        show();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, show);
    };
  }, [show]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, [open]);

  const results = useMemo(() => {
    if (!data) return [];
    const q = query.trim();
    // Match genre labels in the current language too ("fantasi" → fantasy).
    const genreHit = Object.entries(genreLabels).find(([, v]) => v.toLowerCase() === q.toLowerCase())?.[0];
    if (!q) return data.list.slice(0, 8);
    if (genreHit) return data.list.filter((c) => c.g.includes(genreHit as SearchEntry["g"][number])).slice(0, 12);
    return data.fuse.search(q, { limit: 12 }).map((r) => r.item);
  }, [data, query, genreLabels]);

  const close = () => {
    setOpen(false);
    setQuery("");
    setActive(0);
  };

  const go = (slug: string) => {
    close();
    router.push(`/${lang}/comic/${slug}`);
  };

  // Portal: the header's backdrop-filter would otherwise trap position:fixed.
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 p-4 pt-[12vh] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(e) => e.target === e.currentTarget && close()}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={labels.button}
              className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
              initial={{ y: -16, scale: 0.97, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: -8, scale: 0.98, opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
            >
              <div className="flex items-center gap-3 border-b border-border px-4">
                <Search className="size-5 text-muted" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") close();
                    else if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setActive((a) => Math.min(a + 1, results.length - 1));
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setActive((a) => Math.max(a - 1, 0));
                    } else if (e.key === "Enter" && results[active]) go(results[active].s);
                  }}
                  placeholder={labels.placeholder}
                  className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted focus-visible:outline-none"
                />
                <button type="button" onClick={close} className="rounded-lg p-1.5 text-muted hover:bg-surface-2" aria-label="Close">
                  <X className="size-4" />
                </button>
              </div>

              <ul className="max-h-[55vh] overflow-y-auto p-2">
                {!data &&
                  Array.from({ length: 4 }, (_, i) => (
                    <li key={i} className="flex items-center gap-3 p-2">
                      <div className="skeleton h-14 w-10 rounded-md" />
                      <div className="skeleton h-4 w-40 rounded" />
                    </li>
                  ))}
                {data && results.length === 0 && <li className="p-6 text-center text-sm text-muted">{labels.empty}</li>}
                {results.map((r, i) => (
                  <li key={r.s}>
                    <Link
                      href={`/${lang}/comic/${r.s}`}
                      prefetch={false}
                      onClick={close}
                      onMouseEnter={() => setActive(i)}
                      className={`flex items-center gap-3 rounded-xl p-2 transition ${i === active ? "bg-primary/10" : ""}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={r.c} alt="" loading="lazy" className="h-14 w-10 rounded-md object-cover" />
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{lang === "en" && r.e ? r.e : r.t}</p>
                        <p className="truncate text-xs text-muted">{r.g.map((g) => genreLabels[g] ?? g).join(" · ")}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="border-t border-border px-4 py-2 text-xs text-muted">{labels.hint}</p>
            </motion.div>
          </motion.div>
        )}
    </AnimatePresence>,
    document.body,
  );
}
