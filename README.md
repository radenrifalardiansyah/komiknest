# KomikNest

Website baca komik gratis & legal — Next.js 16, bilingual (ID/EN), tema biru gelap/terang, UI 3D, dan biaya hosting Rp 0.

Hanya terbitkan konten yang **kamu miliki**, **public domain**, atau **berlisensi terbuka / berizin** (misalnya CC BY). Setiap komik wajib punya field `license`.

## Stack

| Bagian | Teknologi | Biaya |
| --- | --- | --- |
| Frontend | Next.js 16 (App Router), Tailwind v4, Motion, React Three Fiber | — |
| Hosting | Cloudflare Workers via OpenNext (boleh komersial) | Gratis |
| Cache ISR | Cloudflare R2 + D1 + Durable Object | Gratis |
| Database (opsional) | Supabase Postgres | Gratis (500 MB) |
| Otomasi | GitHub Actions (repo public) | Gratis |
| Iklan | Google AdSense (opsional) | — |

## Menjalankan lokal

```bash
npm install
npm run dev          # http://localhost:3000
```

Tanpa `.env` apa pun, situs berjalan dalam **local mode** dan membaca `content/comics/*.json`. Supabase baru dibutuhkan kalau katalog sudah besar.

## Menambah komik

1. Taruh gambar di `public/comics/<slug>/...` (atau upload ke R2 atau CDN lain).
2. Buat `content/comics/<slug>.json` dengan format yang sama seperti contoh (lihat `scripts/content-schema.ts`).
3. Jalankan `npm run catalog` untuk memvalidasi. Error akan menunjukkan field yang salah.

Contoh komik di `public/samples` dibuat oleh `npm run samples` (art original, CC BY 4.0). Hapus kalau sudah punya konten sendiri.

## Deploy ke Cloudflare (gratis)

```bash
npx wrangler login
npx wrangler r2 bucket create komiknest-cache
npx wrangler d1 create komiknest-tags      # salin database_id ke wrangler.jsonc
npx wrangler secret put REVALIDATE_SECRET   # string acak panjang
npm run deploy
```

Ubah `NEXT_PUBLIC_SITE_URL` di `wrangler.jsonc` ke domainmu.

## Supabase (opsional)

1. Buat project, lalu jalankan `supabase/migrations/0001_init.sql` di SQL Editor.
2. Tambahkan `SUPABASE_URL` dan `SUPABASE_ANON_KEY` ke env Worker (`wrangler secret put`).
3. Di GitHub → Settings → Secrets and variables → Actions:
   - Secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `REVALIDATE_SECRET`
   - Variables: `SITE_URL`, `INGEST_ENABLED=true`
4. Workflow **Ingest content** menyinkronkan `content/` ke Supabase setiap push dan setiap 6 jam, lalu merevalidasi hanya komik yang berubah.

## Cara situs ini tetap di free tier

- **Gambar tidak lewat server**: `<img>` langsung ke sumbernya, dan `images.unoptimized` aktif.
- **ISR**: halaman komik dan bab dibuat sekali lalu disajikan dari cache R2. Database hanya disentuh saat regenerasi.
- **Revalidasi per tag**: hanya komik yang berubah yang dibangun ulang.
- **`prefetch={false}`** di grid dan daftar bab, supaya request tidak berlipat.
- **Search di browser**: satu file JSON kecil ditambah Fuse.js, tanpa query database.
- **Bookmark dan riwayat di `localStorage`**: tanpa auth dan tanpa DB.
- **Scene 3D** hanya berupa geometry (tanpa model atau tekstur), di-load lazy dan hanya di desktop.
- **Sitemap** berisi halaman komik saja (bukan setiap bab), dan `robots.txt` memblokir crawler SEO yang agresif.
- **Skema DB**: satu `text[]` gambar per bab, bukan satu baris per gambar.

## Monetisasi

Isi `NEXT_PUBLIC_ADSENSE_CLIENT` dan slot `NEXT_PUBLIC_ADSENSE_SLOT_*` setelah situs disetujui AdSense. Slot iklan ada di beranda, halaman komik, dan akhir bab. Semua slot tidak tampil sebelum env diisi.

## Script

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js biasa |
| `npm run catalog` | Validasi dan bundle `content/` |
| `npm run samples` | Generate ulang komik contoh |
| `npm run ingest` | Sinkron `content/` ke Supabase (dipakai CI) |
| `npm run preview` | Build dan jalankan di runtime Workers lokal |
| `npm run deploy` | Deploy ke Cloudflare |
