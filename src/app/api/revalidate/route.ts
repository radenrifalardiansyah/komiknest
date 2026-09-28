import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { tags } from "@/lib/data";

/**
 * Called by the ingest workflow after it writes to Supabase:
 *   POST /api/revalidate  Authorization: Bearer <REVALIDATE_SECRET>
 *   { "slugs": ["comic-a", "comic-b"] }
 * Only the listed comics (plus shared lists) are regenerated.
 */

const Body = z.object({ slugs: z.array(z.string().regex(/^[a-z0-9-]+$/)).max(500) });

function authorized(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const given = req.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  if (!secret || given.length !== secret.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(secret));
}

export async function POST(req: Request) {
  if (!authorized(req)) return Response.json({ error: "unauthorized" }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid body" }, { status: 400 });

  for (const slug of parsed.data.slugs) revalidateTag(tags.comic(slug), "max");
  // Home, browse, genre pages and search index read the shared card list.
  revalidateTag(tags.all, "max");
  revalidatePath("/[lang]", "layout");

  return Response.json({ revalidated: parsed.data.slugs.length });
}
