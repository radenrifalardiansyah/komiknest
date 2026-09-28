import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { Logo } from "./logo";
import { NavLinks } from "./nav-links";

export function SiteFooter({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <>
      <footer className="mt-20 border-t border-border bg-surface/50 pb-24 md:pb-0">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto]">
          <div className="space-y-3">
            <Logo lang={lang} />
            <p className="max-w-sm text-sm text-muted">{dict.footer.tagline}</p>
            <p className="text-xs text-muted">
              © {new Date().getFullYear()} KomikNest. {dict.footer.rights}
            </p>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted md:flex-col">
            <li>
              <Link prefetch={false} href={`/${lang}/about`} className="hover:text-fg">
                {dict.footer.about}
              </Link>
            </li>
            <li>
              <Link prefetch={false} href={`/${lang}/about#report`} className="hover:text-fg">
                {dict.footer.report}
              </Link>
            </li>
          </ul>
        </div>
      </footer>
      <nav className="glass fixed inset-x-0 bottom-0 z-50 border-t border-border pb-[env(safe-area-inset-bottom)] md:hidden">
        <NavLinks
          lang={lang}
          variant="bottom"
          labels={{ home: dict.nav.home, browse: dict.nav.browse, library: dict.nav.library }}
        />
      </nav>
    </>
  );
}
