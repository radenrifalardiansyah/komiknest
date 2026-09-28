import { getSearchIndex } from "@/lib/data";

// One small JSON file, cached like a static page and refreshed by tag.
export const revalidate = 3600;

export async function GET() {
  return Response.json(await getSearchIndex(), {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
