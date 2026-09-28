"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Compass, House, Library } from "lucide-react";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  lang: Locale;
  labels: { home: string; browse: string; library: string };
  variant: "top" | "bottom";
}

export function NavLinks({ lang, labels, variant }: Props) {
  const pathname = usePathname();
  const items = [
    { href: `/${lang}`, label: labels.home, icon: House, exact: true },
    { href: `/${lang}/browse`, label: labels.browse, icon: Compass },
    { href: `/${lang}/library`, label: labels.library, icon: Library },
  ];
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  if (variant === "bottom") {
    return (
      <ul className="grid grid-cols-3">
        {items.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition",
                  active ? "text-primary" : "text-muted",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="bottom-nav-pill"
                    className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-primary"
                  />
                )}
                <Icon className="size-5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul className="flex items-center gap-1">
      {items.map(({ href, label, exact }) => {
        const active = isActive(href, exact);
        return (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                "relative rounded-xl px-3 py-2 text-sm font-medium transition",
                active ? "text-fg" : "text-muted hover:text-fg",
              )}
            >
              {active && (
                <motion.span
                  layoutId="top-nav-pill"
                  className="absolute inset-0 -z-10 rounded-xl bg-surface-2"
                  transition={{ type: "spring", stiffness: 500, damping: 36 }}
                />
              )}
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
