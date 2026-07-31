import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { canControlJourney } from "@/constants/permissions";

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

  // v3: guarded manual advance — POST journey/leads/{id}/advance/
  const r = await djangoFetch(`/journey/leads/${leadId}/advance/`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return djangoJson(r);
}
