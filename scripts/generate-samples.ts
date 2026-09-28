/**
 * Generates original, freely-licensed sample comics (SVG art + content JSON)
 * so the site has legal content from day one.
 *
 *   npm run samples
 *
 * Output: public/samples/<slug>/... and content/comics/<slug>.json
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Palette = [string, string, string, string];

interface SampleDef {
  slug: string;
  title: string;
  titleEn: string;
  author: string;
  genres: string[];
  status: "ongoing" | "completed";
  format: "webtoon" | "page";
  featured?: boolean;
  palette: Palette;
  motif: "sky" | "city" | "space" | "sea" | "forest" | "desert";
  synopsis: { id: string; en: string };
  chapterTitles: { id: string; en: string }[];
}

const SAMPLES: SampleDef[] = [
  {
    slug: "penjaga-langit-biru",
    title: "Penjaga Langit Biru",
    titleEn: "Keeper of the Blue Sky",
    author: "Tim KomikNest",
    genres: ["fantasy", "adventure"],
    status: "ongoing",
    format: "webtoon",
    featured: true,
    palette: ["#0b1a3a", "#2563eb", "#38bdf8", "#e0f2fe"],
    motif: "sky",
    synopsis: {
      id: "Arka, pemuda penjaga menara angin, harus menyatukan kembali pulau-pulau langit yang mulai runtuh satu per satu.",
      en: "Arka, a young keeper of the wind tower, must reunite the sky islands before they fall one by one.",
    },
    chapterTitles: [
      { id: "Menara Angin", en: "The Wind Tower" },
      { id: "Pulau yang Jatuh", en: "The Falling Island" },
      { id: "Sayap Pinjaman", en: "Borrowed Wings" },
    ],
  },
  {
    slug: "kopi-dan-kode",
    title: "Kopi & Kode",
    titleEn: "Coffee & Code",
    author: "Tim KomikNest",
    genres: ["slice-of-life", "comedy"],
    status: "ongoing",
    format: "webtoon",
    featured: true,
    palette: ["#1c1917", "#b45309", "#fbbf24", "#fef3c7"],
    motif: "city",
    synopsis: {
      id: "Kisah kocak para programmer di sebuah startup kecil di Bandung yang bertahan hidup dengan kopi dan deadline.",
      en: "The hilarious life of programmers at a tiny Bandung startup, surviving on coffee and deadlines.",
    },
    chapterTitles: [
      { id: "Bug Hari Senin", en: "Monday Bug" },
      { id: "Deploy Jumat Sore", en: "Friday Deploy" },
    ],
  },
  {
    slug: "nebula-delapan",
    title: "Nebula Delapan",
    titleEn: "Nebula Eight",
    author: "Tim KomikNest",
    genres: ["sci-fi", "action"],
    status: "ongoing",
    format: "page",
    featured: true,
    palette: ["#0f0a2e", "#6d28d9", "#22d3ee", "#f0abfc"],
    motif: "space",
    synopsis: {
      id: "Delapan kadet tersesat di tepi galaksi dan harus belajar bekerja sama untuk pulang.",
      en: "Eight cadets stranded at the edge of the galaxy must learn to work together to get home.",
    },
    chapterTitles: [
      { id: "Sinyal Pertama", en: "First Signal" },
      { id: "Gravitasi Nol", en: "Zero Gravity" },
      { id: "Bintang Kembar", en: "Twin Stars" },
    ],
  },
  {
    slug: "rahasia-rumah-kaca",
    title: "Rahasia Rumah Kaca",
    titleEn: "Secret of the Glasshouse",
    author: "Tim KomikNest",
    genres: ["mystery", "drama"],
    status: "completed",
    format: "page",
    palette: ["#052e16", "#15803d", "#86efac", "#f0fdf4"],
    motif: "forest",
    synopsis: {
      id: "Sebuah rumah kaca tua menyimpan tanaman yang hanya mekar saat seseorang berbohong.",
      en: "An old glasshouse hides a plant that only blooms when someone tells a lie.",
    },
    chapterTitles: [
      { id: "Bunga Pertama", en: "The First Bloom" },
      { id: "Kebenaran", en: "The Truth" },
    ],
  },
  {
    slug: "arus-samudra",
    title: "Arus Samudra",
    titleEn: "Ocean Current",
    author: "Tim KomikNest",
    genres: ["adventure", "drama"],
    status: "ongoing",
    format: "webtoon",
    palette: ["#082f49", "#0369a1", "#67e8f9", "#ecfeff"],
    motif: "sea",
    synopsis: {
      id: "Nelayan muda Laut menemukan peta arus kuno yang menuntunnya ke pulau yang tak tercatat.",
      en: "Young fisher Laut finds an ancient current map leading to an uncharted island.",
    },
    chapterTitles: [
      { id: "Peta Basah", en: "The Wet Map" },
      { id: "Badai Kecil", en: "A Small Storm" },
    ],
  },
  {
    slug: "si-kucing-pos",
    title: "Si Kucing Pos",
    titleEn: "The Postal Cat",
    author: "Tim KomikNest",
    genres: ["kids", "comedy"],
    status: "completed",
    format: "page",
    palette: ["#431407", "#ea580c", "#fdba74", "#fff7ed"],
    motif: "city",
    synopsis: {
      id: "Kucing oranye bernama Surat mengantar paket ke seluruh kota — asal ada ikan di ujung perjalanan.",
      en: "An orange cat named Letter delivers parcels across town — as long as there's fish at the end.",
    },
    chapterTitles: [{ id: "Paket Misterius", en: "Mystery Parcel" }],
  },
  {
    slug: "jejak-kerajaan",
    title: "Jejak Kerajaan",
    titleEn: "Trail of the Kingdom",
    author: "Tim KomikNest",
    genres: ["history", "adventure"],
    status: "ongoing",
    format: "page",
    palette: ["#27180a", "#a16207", "#fde047", "#fefce8"],
    motif: "desert",
    synopsis: {
      id: "Dua pelajar menelusuri prasasti di kampung halaman dan menemukan kisah kerajaan yang terlupakan.",
      en: "Two students trace an inscription in their hometown and uncover a forgotten kingdom's tale.",
    },
    chapterTitles: [
      { id: "Prasasti", en: "The Inscription" },
      { id: "Sungai Emas", en: "Golden River" },
    ],
  },
  {
    slug: "robot-sawah",
    title: "Robot Sawah",
    titleEn: "Paddy Robot",
    author: "Tim KomikNest",
    genres: ["sci-fi", "comedy", "kids"],
    status: "ongoing",
    format: "webtoon",
    palette: ["#14261a", "#16a34a", "#a3e635", "#f7fee7"],
    motif: "forest",
    synopsis: {
      id: "Robot petani buatan kakek Dimas ingin sekali jadi orang-orangan sawah yang ditakuti burung.",
      en: "Grandpa Dimas's farming robot dreams of becoming a scarecrow the birds actually fear.",
    },
    chapterTitles: [
      { id: "Musim Tanam", en: "Planting Season" },
      { id: "Burung Pipit", en: "The Sparrows" },
    ],
  },
];

// ---------------------------------------------------------------- utilities

function rng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** A landscape scene inside a w×h box. */
function scene(
  r: () => number,
  p: Palette,
  motif: SampleDef["motif"],
  w: number,
  h: number,
  id: string,
) {
  const [dark, mid, light, pale] = p;
  const parts: string[] = [
    `<defs><linearGradient id="g${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${dark}"/><stop offset="1" stop-color="${mid}"/></linearGradient></defs>`,
    `<rect width="${w}" height="${h}" fill="url(#g${id})"/>`,
  ];

  if (motif === "space") {
    for (let i = 0; i < 40; i++) {
      parts.push(
        `<circle cx="${(r() * w).toFixed(1)}" cy="${(r() * h).toFixed(1)}" r="${(r() * 2 + 0.4).toFixed(1)}" fill="${pale}" opacity="${(r() * 0.8 + 0.2).toFixed(2)}"/>`,
      );
    }
    parts.push(
      `<circle cx="${w * (0.2 + r() * 0.6)}" cy="${h * (0.2 + r() * 0.4)}" r="${Math.min(w, h) * (0.12 + r() * 0.12)}" fill="${light}" opacity=".85"/>`,
    );
  } else {
    parts.push(
      `<circle cx="${w * (0.15 + r() * 0.7)}" cy="${h * (0.18 + r() * 0.2)}" r="${Math.min(w, h) * 0.1}" fill="${pale}" opacity=".9"/>`,
    );
  }

  const ground = (y: number, amp: number, color: string, op: number) => {
    let d = `M0 ${h} L0 ${y}`;
    const steps = 6;
    for (let i = 1; i <= steps; i++) {
      const x = (w / steps) * i;
      const cy = y + (r() - 0.5) * amp;
      d += ` Q${x - w / steps / 2} ${cy - amp * 0.6} ${x} ${cy}`;
    }
    d += ` L${w} ${h} Z`;
    return `<path d="${d}" fill="${color}" opacity="${op}"/>`;
  };

  switch (motif) {
    case "city": {
      let x = 0;
      while (x < w) {
        const bw = 30 + r() * 60;
        const bh = h * (0.2 + r() * 0.45);
        parts.push(
          `<rect x="${x.toFixed(1)}" y="${(h - bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" fill="${dark}" opacity=".85"/>`,
        );
        for (let wy = h - bh + 10; wy < h - 10; wy += 18) {
          if (r() > 0.55)
            parts.push(
              `<rect x="${(x + 8).toFixed(1)}" y="${wy.toFixed(1)}" width="8" height="8" fill="${light}" opacity=".8"/>`,
            );
        }
        x += bw + 4;
      }
      break;
    }
    case "sea":
      for (let i = 0; i < 4; i++)
        parts.push(ground(h * (0.55 + i * 0.1), 30, i % 2 ? light : dark, 0.35 + i * 0.15));
      break;
    case "desert":
      parts.push(ground(h * 0.6, 60, light, 0.6), ground(h * 0.75, 40, dark, 0.8));
      parts.push(
        `<polygon points="${w * 0.6},${h * 0.62} ${w * 0.72},${h * 0.35} ${w * 0.84},${h * 0.62}" fill="${dark}" opacity=".7"/>`,
      );
      break;
    case "forest":
      parts.push(ground(h * 0.7, 40, dark, 0.7));
      for (let i = 0; i < 9; i++) {
        const tx = r() * w;
        const ty = h * (0.55 + r() * 0.25);
        const s = 20 + r() * 40;
        parts.push(
          `<polygon points="${tx},${ty - s * 2} ${tx - s},${ty} ${tx + s},${ty}" fill="${dark}" opacity=".9"/>`,
        );
      }
      break;
    case "sky":
      for (let i = 0; i < 3; i++) {
        const ix = w * (0.15 + r() * 0.7);
        const iy = h * (0.35 + r() * 0.35);
        const iw = 60 + r() * 90;
        parts.push(
          `<ellipse cx="${ix}" cy="${iy}" rx="${iw}" ry="${iw * 0.25}" fill="${light}" opacity=".9"/>`,
          `<polygon points="${ix - iw * 0.8},${iy} ${ix + iw * 0.8},${iy} ${ix},${iy + iw * 0.9}" fill="${dark}" opacity=".75"/>`,
        );
      }
      break;
    case "space":
      parts.push(ground(h * 0.85, 20, dark, 0.9));
      break;
  }
  return parts.join("");
}

/** Simple original character: round head, body, expressive eyes. */
function character(r: () => number, p: Palette, x: number, y: number, s: number) {
  const [dark, , light, pale] = p;
  const eyeDx = s * 0.18;
  const look = (r() - 0.5) * s * 0.06;
  return [
    `<ellipse cx="${x}" cy="${y + s * 1.05}" rx="${s * 0.55}" ry="${s * 0.7}" fill="${light}" stroke="${dark}" stroke-width="3"/>`,
    `<circle cx="${x}" cy="${y}" r="${s * 0.5}" fill="${pale}" stroke="${dark}" stroke-width="3"/>`,
    `<circle cx="${x - eyeDx + look}" cy="${y - s * 0.02}" r="${s * 0.07}" fill="${dark}"/>`,
    `<circle cx="${x + eyeDx + look}" cy="${y - s * 0.02}" r="${s * 0.07}" fill="${dark}"/>`,
    r() > 0.5
      ? `<path d="M${x - s * 0.15} ${y + s * 0.2} Q${x} ${y + s * 0.32} ${x + s * 0.15} ${y + s * 0.2}" stroke="${dark}" stroke-width="3" fill="none" stroke-linecap="round"/>`
      : `<circle cx="${x}" cy="${y + s * 0.24}" r="${s * 0.06}" fill="${dark}"/>`,
  ].join("");
}

/** Wordless speech bubble (language-neutral). */
function bubble(r: () => number, x: number, y: number, w: number) {
  const h = w * 0.45;
  const lines = Array.from({ length: 2 + Math.floor(r() * 2) }, (_, i) => {
    const lw = w * (0.45 + r() * 0.35);
    const ly = y - h / 2 + h * 0.3 + i * (h * 0.2);
    return `<rect x="${x - lw / 2}" y="${ly}" width="${lw}" height="${h * 0.08}" rx="${h * 0.04}" fill="#94a3b8"/>`;
  }).join("");
  return `<ellipse cx="${x}" cy="${y}" rx="${w / 2}" ry="${h / 2}" fill="#fff" stroke="#0f172a" stroke-width="3"/><polygon points="${x - w * 0.1},${y + h * 0.42} ${x + w * 0.05},${y + h * 0.45} ${x - w * 0.2},${y + h * 0.8}" fill="#fff" stroke="#0f172a" stroke-width="3" stroke-linejoin="round"/>${lines}`;
}

function panel(
  r: () => number,
  def: SampleDef,
  x: number,
  y: number,
  w: number,
  h: number,
  id: string,
) {
  const inner = [scene(r, def.palette, def.motif, w, h, id)];
  const count = r() > 0.4 ? 1 : 2;
  for (let i = 0; i < count; i++) {
    const s = Math.min(w, h) * (0.16 + r() * 0.1);
    const cx = w * (count === 1 ? 0.3 + r() * 0.4 : 0.25 + i * 0.5);
    inner.push(character(r, def.palette, cx, h - s * 1.9, s));
  }
  if (r() > 0.3) inner.push(bubble(r, w * (0.3 + r() * 0.4), h * 0.2, Math.min(w * 0.55, 260)));
  return `<g transform="translate(${x} ${y})"><svg width="${w}" height="${h}" overflow="hidden">${inner.join("")}</svg><rect width="${w}" height="${h}" fill="none" stroke="#0f172a" stroke-width="6"/></g>`;
}

function pageSvg(def: SampleDef, seed: string) {
  const r = rng(seed);
  const W = 800;
  const H = def.format === "webtoon" ? 1280 : 1200;
  const G = 24;
  const panels: string[] = [];
  if (def.format === "webtoon") {
    const n = 2 + Math.floor(r() * 2);
    const ph = (H - G * (n + 1)) / n;
    for (let i = 0; i < n; i++) {
      const inset = r() > 0.5 ? 60 : 0;
      panels.push(panel(r, def, G + (i % 2 ? inset : 0), G + i * (ph + G), W - G * 2 - inset, ph, `${seed}-${i}`));
    }
  } else {
    const rows = 3;
    const rh = (H - G * (rows + 1)) / rows;
    for (let row = 0; row < rows; row++) {
      const split = r() > 0.35;
      const y = G + row * (rh + G);
      if (split) {
        const cw = (W - G * 3) * (0.35 + r() * 0.3);
        panels.push(panel(r, def, G, y, cw, rh, `${seed}-${row}a`));
        panels.push(panel(r, def, G * 2 + cw, y, W - G * 3 - cw, rh, `${seed}-${row}b`));
      } else {
        panels.push(panel(r, def, G, y, W - G * 2, rh, `${seed}-${row}`));
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fafafa"/>${panels.join("")}</svg>`;
}

function coverSvg(def: SampleDef) {
  const r = rng(def.slug + "cover");
  const W = 600;
  const H = 900;
  const [dark, , light, pale] = def.palette;
  const words = def.title.split(" ");
  const lines: string[] = [];
  for (const word of words) {
    const last = lines[lines.length - 1];
    if (last && (last + " " + word).length <= 12) lines[lines.length - 1] = last + " " + word;
    else lines.push(word);
  }
  const title = lines
    .map(
      (l, i) =>
        `<text x="48" y="${130 + i * 76}" font-family="'Plus Jakarta Sans',system-ui,sans-serif" font-size="68" font-weight="800" fill="${pale}" stroke="${dark}" stroke-width="2" paint-order="stroke">${esc(l)}</text>`,
    )
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${scene(r, def.palette, def.motif, W, H, "c")}${character(r, def.palette, W * 0.5, H * 0.62, 110)}<rect x="0" y="0" width="${W}" height="${60 + lines.length * 76 + 40}" fill="${dark}" opacity=".35"/>${title}<text x="48" y="${H - 48}" font-family="system-ui,sans-serif" font-size="24" font-weight="600" fill="${light}" letter-spacing="4">KOMIKNEST ORIGINAL</text></svg>`;
}

// ---------------------------------------------------------------- main

const root = process.cwd();
const baseDate = Date.UTC(2026, 8, 1);

SAMPLES.forEach((def, ci) => {
  const dir = join(root, "public", "samples", def.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "cover.svg"), coverSvg(def));

  const chapters = def.chapterTitles.flatMap((t, i) => {
    const number = i + 1;
    const cdir = join(dir, `c${number}`);
    mkdirSync(cdir, { recursive: true });
    const pages = 4 + ((ci + i) % 3);
    const images: string[] = [];
    for (let pi = 1; pi <= pages; pi++) {
      const file = `${String(pi).padStart(2, "0")}.svg`;
      writeFileSync(join(cdir, file), pageSvg(def, `${def.slug}-${number}-${pi}`));
      images.push(file);
    }
    const publishedAt = new Date(baseDate + (ci * 3 + i * 5) * 86_400_000).toISOString();
    // Wordless art → the same pages serve both languages.
    return (["id", "en"] as const).map((lang) => ({
      number,
      lang,
      title: t[lang],
      publishedAt,
      imageBase: `/samples/${def.slug}/c${number}/`,
      images,
    }));
  });

  const content = {
    slug: def.slug,
    title: def.title,
    titleEn: def.titleEn,
    author: def.author,
    artist: def.author,
    cover: `/samples/${def.slug}/cover.svg`,
    synopsis: def.synopsis,
    genres: def.genres,
    status: def.status,
    format: def.format,
    featured: def.featured ?? false,
    license: "CC BY 4.0",
    sourceName: "KomikNest Original",
    sourceUrl: null,
    chapters,
  };
  writeFileSync(join(root, "content", "comics", `${def.slug}.json`), JSON.stringify(content, null, 2) + "\n");
});

console.log(`Generated ${SAMPLES.length} sample comics.`);
