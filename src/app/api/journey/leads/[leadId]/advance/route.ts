import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { canControlJourney } from "@/constants/permissions";
import { JOURNEY_EVENTS, type JourneyEvent } from "@/constants/journeyStates";
import { advanceJourney } from "@/mocks/journeyDb";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  // Mirror the backend IsJourneyController gate (ADMIN/ASSESSMENT).
  if (!canControlJourney(user.role)) {
    return NextResponse.json(
      { detail: "You do not have permission to advance a journey." },
      { status: 403 },
    );
  }
  const { leadId } = await params;
  const body = await req.json().catch(() => ({}));

  if (!siteConfig.useMocks) {
    // v3: guarded manual advance — POST journey/leads/{id}/advance/
    const r = await djangoFetch(`/journey/leads/${leadId}/advance/`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return djangoJson(r);
  }

  const event = body?.event as JourneyEvent;
  if (!(JOURNEY_EVENTS as readonly string[]).includes(event)) {
    return NextResponse.json({ detail: "Invalid or missing event." }, { status: 400 });
  }
  const outcome = advanceJourney(leadId, event);
  if (!outcome.ok) {
    return NextResponse.json({ detail: outcome.detail }, { status: outcome.status });
  }
  return NextResponse.json(outcome.result);
}
