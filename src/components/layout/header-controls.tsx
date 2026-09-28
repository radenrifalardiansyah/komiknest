"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Languages, Moon, Sun } from "lucide-react";
import type { Locale } from "@/lib/types";

const noop = () => () => {};
const useMounted = () => useSyncExternalStore(noop, () => true, () => false);

export function ThemeToggle({ label }: { label: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const dark = mounted && resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={label}
      title={label}
      className="grid size-10 place-items-center rounded-xl text-muted transition hover:bg-surface-2 hover:text-fg"
    >
      {mounted ? dark ? <Sun className="size-5" /> : <Moon className="size-5" /> : <span className="size-5" />}
    </button>
  );
}

export function LangSwitch({ lang, label }: { lang: Locale; label: string }) {
  const pathname = usePathname();
  const other: Locale = lang === "id" ? "en" : "id";
  const href = pathname.replace(/^\/(id|en)(?=\/|$)/, `/${other}`);
  return (
    <Link
      href={href}
      prefetch={false}
      aria-label={`${label}: ${other.toUpperCase()}`}
      title={label}
      className="flex h-10 items-center gap-1.5 rounded-xl px-2.5 text-sm font-semibold text-muted transition hover:bg-surface-2 hover:text-fg"
    >
      <Languages className="size-4" />
      <span>{lang.toUpperCase()}</span>
    </Link>
  );
}
