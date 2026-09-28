"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Play } from "lucide-react";
import { useHistory } from "@/hooks/use-local-store";
import type { Locale } from "@/lib/types";

export function ContinueReading({ lang, title, chapterLabel }: { lang: Locale; title: string; chapterLabel: string }) {
  const [history] = useHistory();
  if (history.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <h2 className="mb-4 text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
        {history.slice(0, 10).map((h, i) => (
          <motion.div
            key={h.slug}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="shrink-0"
          >
            <Link
              href={`/${lang}/comic/${h.slug}/${h.chapter}`}
              prefetch={false}
              className="group flex w-72 items-center gap-3 rounded-2xl border border-border bg-surface p-2.5 transition hover:border-primary/60 hover:shadow-lg"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={h.cover} alt="" loading="lazy" className="h-20 w-14 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold group-hover:text-primary">
                  {lang === "en" && h.titleEn ? h.titleEn : h.title}
                </p>
                <p className="text-sm text-muted">
                  {chapterLabel} {h.chapter}
                </p>
              </div>
              <span className="grid size-10 place-items-center rounded-full bg-primary text-primary-fg shadow-md shadow-primary/30 transition group-hover:scale-110">
                <Play className="size-4 translate-x-px fill-current" />
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
