import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LibraryView } from "@/components/comic/library-view";
import { getDictionary, hasLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/library">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { title: getDictionary(lang).library.title, robots: { index: false } };
}

export default async function LibraryPage({ params }: PageProps<"/[lang]/library">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{dict.library.title}</h1>
      <LibraryView lang={lang} labels={{ ...dict.library, chapter: dict.comic.chapter }} />
    </div>
  );
}
