# 📘 Blueprint Arsitektur Web Baca Komik (Otomatis, Fast & 100% Gratis)

Dokumen ini berisi panduan teknis lengkap untuk membangun situs web agregator/baca komik secara independen menggunakan **JAMstack (Modern Web Development)** dengan biaya operasional Rp 0 (*Free Tier Compatible*).

---

## 1. Arsitektur & Kombinasi Teknologi (*Tech Stack*)

Untuk menghindari biaya *storage*, *bandwidth*, dan keterbatasan (*limit*) hosting gratisan, peranan teknologi dipisahkan berdasarkan fungsi terbaiknya:

| Komponen | Teknologi | Alasan & Fungsi Utama | Biaya |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **Next.js** (App Router / Pages) | Menampilkan antarmuka web, mendukung SEO, dan memiliki fitur Caching otomatis (ISR). | Gratis |
| **Hosting & Deployment**| **Vercel** | Menjamu (*host*) aplikasi Next.js dengan jaringan CDN global berkecepatan tinggi. | Gratis (*Hobby*) |
| **Database** | **Supabase** | Menyimpan data teks metadata (Judul, Bab, Genre, dan Link URL Gambar). | Gratis (sampai 500 MB) |
| **Scraper / Bot Update** | **GitHub Actions** | Menjalankan skrip *scraping* otomatis berkala (Cron Job) tanpa membebani Vercel. | Gratis (2.000 menit/bln) |
| **Penyimpanan Gambar** | **Direct Hotlink / Cloudflare Proxy** | Memuat gambar langsung dari URL server sumber tanpa menyimpan file fisik. | Gratis |

---

## 2. Alur Kerja Sistem (*Data Workflow*)

Proses pengumpulan data hingga penyajian ke pembaca berjalan secara otomatis dalam 3 tahap:

```
[ 1. GitHub Actions (Cron) ] ──(Scrape API/Web)──> [ 2. Supabase Database ]
                                                            │
                                                            ▼
[ Pembaca / Browser ] <──(Load Static Page)─── [ 3. Vercel + Next.js (ISR) ]
```

1. **Pengambilan Data (Background):** GitHub Actions mengecek pembaruan komik secara berkala dan mengirim teks data baru ke Supabase.
2. **Penyimpanan Metadata:** Supabase menyimpan tautan URL gambar (bukan berkas gambar fisik).
3. **Penyajian Cepat:** Next.js membuat halaman komik dalam bentuk statis (*cache*) sehingga Vercel tidak perlu memanggil database berulang kali saat dibaca banyak orang.

---

## 3. Desain Skema Database (Supabase PostgreSQL)

Buat 3 tabel utama pada PostgreSQL Supabase Anda:

### A. Tabel `comics` (Metadata Komik)
```sql
CREATE TABLE comics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  cover_url TEXT,
  synopsis TEXT,
  genres TEXT[],
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### B. Tabel `chapters` (Daftar Bab/Chapter)
```sql
CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comic_id UUID REFERENCES comics(id) ON DELETE CASCADE,
  chapter_number NUMERIC NOT NULL,
  title VARCHAR,
  release_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### C. Tabel `chapter_images` (Daftar Gambar per Bab)
```sql
CREATE TABLE chapter_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  page_index INT NOT NULL,
  image_url TEXT NOT NULL
);
```

---

## 4. Konfigurasi GitHub Actions (Otomatisasi Scraper)

Gunakan GitHub Actions untuk menjalankan bot *scraper* tanpa risiko pemutusan koneksi (*timeout*) di Vercel.

Buat berkas `.github/workflows/scraper.yml` pada repositori Anda:

```yaml
name: Comic Scraper Bot

on:
  schedule:
    # Berjalan otomatis setiap 3 jam sekali
    - cron: '0 */3 * * *'
  workflow_dispatch: # Memungkinkan eksekusi manual dari dashboard GitHub

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install Dependencies
        run: npm install axios cheerio @supabase/supabase-js

      - name: Run Scraper Script
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
        run: node scripts/scraper.js
```

---

## 5. Strategi Menghindari Limit Gratisan (*Free Tier Limits*)

### 🚨 Problem 1: Limit Bandwidth Vercel (100 GB/bulan)
* **Penyebab:** Mengunduh atau meneruskan (*proxy*) berkas gambar komik langsung melalui Vercel.
* **Solusi:** 
  * Gunakan tag `<img src="URL_ASLI_GAMBAR" />` langsung di antarmuka Next.js.
  * Hanya kirimkan data teks JSON dari Vercel ke pembaca.

### 🚨 Problem 2: Limit Query Supabase & Serverless Invocation
* **Penyebab:** Setiap pembaca mengklik bab, web selalu meminta data baru ke Supabase.
* **Solusi:** Manfaatkan **Incremental Static Regeneration (ISR)** di Next.js:

```javascript
// Contoh di Next.js (Pages Router / App Router revalidate)
export async function getStaticProps({ params }) {
  const chapterData = await fetchChapterFromSupabase(params.id);

  return {
    props: { chapterData },
    // Caching halaman di Vercel CDN selama 24 jam (86400 detik)
    revalidate: 86400, 
  };
}
```

### 🚨 Problem 3: Proteksi Gambar (*Anti-Hotlinking*)
* **Penyebab:** Server sumber komik memblokir gambar jika dibuka dari domain web Anda.
* **Solusi:** 
  * Tambahkan tag `<meta name="referrer" content="no-referrer" />` pada `<head>` HTML Anda, ATAU
  * Buat skrip **Cloudflare Worker** gratisan sebagai proxy pemutar *Referer* gambar.

---

## 6. Ringkasan Kesimpulan

Dengan menerapkan skema ini:
1. **Biaya Server & Storage:** Rp 0 (Tidak perlu menyewa VPS atau Cloud Storage mahal).
2. **Kinerja:** Web memuat halaman sangat cepat karena memanfaatkan fitur *Cache* CDN Vercel.
3. **Pemeliharaan:** Otomatis berjalan sendiri mengambil bab terbaru menggunakan GitHub Actions.