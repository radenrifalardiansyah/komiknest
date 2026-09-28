import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Section({
  title,
  href,
  linkLabel,
  children,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
        {href && (
          <Link
            href={href}
            prefetch={false}
            className="group inline-flex items-center gap-1 text-sm font-semibold text-primary"
          >
            {linkLabel}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
