import Link from "next/link";

// not-found has no params; show both languages.
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-gradient text-7xl font-extrabold">404</p>
      <h1 className="text-xl font-bold">Halaman tidak ditemukan · Page not found</h1>
      <p className="text-muted">Mungkin komiknya sudah pindah rak. · Maybe the comic moved to another shelf.</p>
      <div className="flex gap-3">
        <Link href="/id" className="rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-fg">
          Beranda
        </Link>
        <Link href="/en" className="rounded-xl border border-border px-5 py-2.5 font-semibold">
          Home
        </Link>
      </div>
    </div>
  );
}
