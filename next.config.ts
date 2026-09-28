import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Comic pages are served straight from their origin (or R2). Next's image
    // optimizer would re-process every page and burn free-tier quotas.
    unoptimized: true,
  },
  async redirects() {
    // Locale detection without proxy/middleware: a static redirect rule.
    return [
      {
        source: "/",
        has: [{ type: "header", key: "accept-language", value: "^en.*" }],
        destination: "/en",
        permanent: false,
      },
      { source: "/", destination: "/id", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/samples/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;

if (process.env.NODE_ENV === "development") {
  // Exposes Cloudflare bindings (R2, D1…) to `next dev`.
  import("@opennextjs/cloudflare").then((m) => m.initOpenNextCloudflareForDev());
}
