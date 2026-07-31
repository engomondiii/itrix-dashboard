import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";

/** Book a meeting for a lead (captures details, moves status to "Meeting Booked"). */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const { leadId } = await params;
  const body = await req.json().catch(() => ({}));

  // v3: lead meeting-booking endpoint
  const r = await djangoFetch(`/leads/${leadId}/meeting/`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return djangoJson(r);
}
