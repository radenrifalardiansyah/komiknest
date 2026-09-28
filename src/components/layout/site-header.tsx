import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { Logo } from "./logo";
import { LangSwitch, ThemeToggle } from "./header-controls";
import { NavLinks } from "./nav-links";
import { SearchPalette, SearchTrigger } from "./search-palette";

export function SiteHeader({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <header className="glass sticky top-0 z-50 border-b border-border/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Logo lang={lang} />
        <nav className="ml-6 hidden md:block">
          <NavLinks
            lang={lang}
            variant="top"
            labels={{ home: dict.nav.home, browse: dict.nav.browse, library: dict.nav.library }}
          />
        </nav>
        <div className="ml-auto flex flex-1 items-center justify-end gap-1 md:flex-none">
          <div className="hidden flex-1 sm:block md:flex-none">
            <SearchTrigger label={dict.nav.search} />
          </div>
          <LangSwitch lang={lang} label={dict.nav.language} />
          <ThemeToggle label={dict.nav.theme} />
          <Link
            href={`/${lang}/about`}
            prefetch={false}
            className="hidden h-10 items-center rounded-xl px-3 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-fg lg:flex"
          >
            {dict.nav.about}
          </Link>
        </div>
      </div>
      {/* Mobile search row */}
      <div className="px-4 pb-3 sm:hidden">
        <SearchTrigger label={dict.nav.search} />
      </div>
      <SearchPalette
        lang={lang}
        genreLabels={dict.genres}
        labels={{
          button: dict.nav.search,
          placeholder: dict.search.placeholder,
          empty: dict.search.empty,
          hint: dict.search.hint,
        }}
      />
    </header>
  );
}
