import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Flag, Palette, ShieldCheck } from "lucide-react";
import { getDictionary, hasLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { title: getDictionary(lang).about.title, alternates: { canonical: `/${lang}/about` } };
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const { about } = getDictionary(lang);
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@komiknest.example";

  const cards = [
    { icon: ShieldCheck, title: about.title, body: about.body, id: "about" },
    { icon: Palette, title: about.creatorsTitle, body: about.creatorsBody, id: "creators" },
    { icon: Flag, title: about.reportTitle, body: about.reportBody, id: "report" },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{about.title}</h1>
      {cards.map(({ icon: Icon, title, body, id }) => (
        <section key={id} id={id} className="scroll-mt-24 rounded-3xl border border-border bg-surface p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
            <h2 className="text-lg font-bold">{title}</h2>
          </div>
          <p className="leading-relaxed text-muted">{body}</p>
          {id !== "about" && (
            <a href={`mailto:${email}`} className="mt-3 inline-block font-semibold text-primary hover:underline">
              {email}
            </a>
          )}
        </section>
      ))}
    </div>
  );
}
