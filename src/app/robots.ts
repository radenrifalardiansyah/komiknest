import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/i18n";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/*/library"] },
      // Aggressive SEO/AI crawlers that generate load without sending readers.
      { userAgent: ["AhrefsBot", "SemrushBot", "MJ12bot", "DotBot", "PetalBot", "Bytespider"], disallow: "/" },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
