import Link from "next/link";
import type { Locale } from "@/lib/types";

export function Logo({ lang }: { lang: Locale }) {
  return (
    <Link href={`/${lang}`} className="group flex items-center gap-2 font-extrabold tracking-tight">
      <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30 transition-transform group-hover:-rotate-6 group-hover:scale-105">
        <svg viewBox="0 0 64 64" className="size-6" aria-hidden>
          <path d="M10 18c7-4 14-4 22 1v30c-8-5-15-5-22-1z" fill="#fff" />
          <path d="M54 18c-7-4-14-4-22 1v30c8-5 15-5 22-1z" fill="#fff" opacity=".7" />
        </svg>
      </span>
      <span className="text-lg">
        Komik<span className="text-gradient">Nest</span>
      </span>
    </Link>
  );
}
