import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getDictionary, hasLocale, siteUrl } from "@/lib/i18n";
import { LOCALES } from "@/lib/types";
import "../globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const generateStaticParams = () => LOCALES.map((lang) => ({ lang }));

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1120" },
  ],
};

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: dict.meta.title, template: "%s · KomikNest" },
    description: dict.meta.description,
    applicationName: "KomikNest",
    alternates: {
      canonical: `/${lang}`,
      languages: { id: "/id", en: "/en", "x-default": "/id" },
    },
    openGraph: {
      type: "website",
      siteName: "KomikNest",
      locale: lang === "id" ? "id_ID" : "en_US",
      title: dict.meta.title,
      description: dict.meta.description,
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  return (
    <html lang={lang} suppressHydrationWarning className={jakarta.variable}>
      <head>
        {adClient && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="min-h-dvh">
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-fg"
          >
            Skip to content
          </a>
          <SiteHeader lang={lang} dict={dict} />
          <main id="main">{children}</main>
          <SiteFooter lang={lang} dict={dict} />
        </Providers>
      </body>
    </html>
  );
}
