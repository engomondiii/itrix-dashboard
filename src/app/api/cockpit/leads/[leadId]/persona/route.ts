import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { getPersonaMatch } from "@/mocks/personasDb";

/**
 * The persona hypothesis for one lead.
 *
 * A 204 is the right answer when nothing matched — an empty body says "no
 * hypothesis" without the client having to distinguish a missing lead from a
 * lead the matcher could not place.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { leadId } = await params;

  if (!siteConfig.useMocks) {
    // v6: GET cockpit/leads/{id}/persona/ — team plane only.
    const r = await djangoFetch(`/cockpit/leads/${leadId}/persona/`);
    return djangoJson(r);
  }

  const match = getPersonaMatch(leadId);
  if (!match) return new NextResponse(null, { status: 204 });
  return NextResponse.json(match);
}
