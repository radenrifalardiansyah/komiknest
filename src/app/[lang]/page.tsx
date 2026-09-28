import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { ComicGrid, ComicRail } from "@/components/comic/comic-card";
import { ContinueReading } from "@/components/comic/continue-reading";
import { HeroVisual } from "@/components/three/hero-visual";
import { AdSlot } from "@/components/ui/ad-slot";
import { Section } from "@/components/ui/section";
import { getFeatured, getLatest } from "@/lib/data";
import { getDictionary, hasLocale } from "@/lib/i18n";
import { GENRES } from "@/lib/types";

export const revalidate = 3600;

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const [featured, latest] = await Promise.all([getFeatured(), getLatest(18)]);

  return (
    <div className="space-y-14 pb-6">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-40 -top-40 size-[520px] rounded-full bg-primary/25 blur-[120px]" />
          <div className="absolute -right-32 top-20 size-[420px] rounded-full bg-accent/20 blur-[120px]" />
          <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent)] opacity-60" />
        </div>
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 md:min-h-[520px] md:grid-cols-2 md:py-16">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" />
              {dict.hero.badge}
            </span>
            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              {dict.hero.title} <span className="text-gradient">{dict.hero.titleAccent}</span>
            </h1>
            <p className="max-w-lg text-base text-muted sm:text-lg">{dict.hero.subtitle}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={featured[0] ? `/${lang}/comic/${featured[0].slug}` : `/${lang}/browse`}
                className="inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-6 font-semibold text-white shadow-lg shadow-primary/30 transition hover:brightness-110 active:scale-[.98]"
              >
                {dict.hero.cta}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={`/${lang}/browse`}
                className="inline-flex h-12 items-center rounded-2xl border border-border bg-surface px-6 font-semibold transition hover:border-primary/50"
              >
                {dict.hero.ctaSecondary}
              </Link>
            </div>
          </div>
          <div className="h-[260px] sm:h-[340px] md:h-[460px]">
            <HeroVisual />
          </div>
        </div>
      </section>

      <ContinueReading lang={lang} title={dict.home.continue} chapterLabel={dict.comic.chapter} />

      <Section title={dict.home.featured}>
        <ComicRail comics={featured} lang={lang} dict={dict} />
      </Section>

      <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME} label={dict.common.ad} className="px-4" />

      <Section title={dict.home.latest} href={`/${lang}/browse`} linkLabel={dict.home.seeAll}>
        <ComicGrid comics={latest} lang={lang} dict={dict} />
      </Section>

      <Section title={dict.home.genres}>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <Link
              key={g}
              href={`/${lang}/genre/${g}`}
              prefetch={false}
              className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5 hover:border-primary hover:text-primary hover:shadow-md"
            >
              {dict.genres[g]}
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}
