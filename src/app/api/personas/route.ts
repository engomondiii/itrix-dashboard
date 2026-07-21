import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { listPersonas } from "@/mocks/personasDb";

/**
 * The target-account persona registry — TEAM PLANE ONLY.
 *
 * `apps/personas` serves this behind a team-only serializer. It is proxied here
 * and nowhere else: there is no portal or public route to a persona, and adding
 * one would breach the serializer deny-list that keeps `persona_id` off every
 * client-plane payload (Architecture v2.6 §10.5).
 *
 * Read-only. The registry is seeded by `seed_personas` from the workbook; it is
 * not editable from a CRM screen.
 */
export async function GET(req: Request) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const family = new URL(req.url).searchParams.get("family") ?? undefined;

  if (!siteConfig.useMocks) {
    // v6: GET personas/ (team) — optionally filtered by functional family.
    const qs = family ? `?family=${encodeURIComponent(family)}` : "";
    const r = await djangoFetch(`/personas/${qs}`);
    return djangoJson(r);
  }

  return NextResponse.json({ results: listPersonas(family) });
}
