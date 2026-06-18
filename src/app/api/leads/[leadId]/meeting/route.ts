import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { bookMeeting, getLead } from "@/mocks/leadsDb";

/** Book a meeting for a lead (captures details, moves status to "Meeting Booked"). */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const { leadId } = await params;
  const body = await req.json().catch(() => ({}));

  if (!siteConfig.useMocks) {
    // v3: lead meeting-booking endpoint
    const r = await djangoFetch(`/leads/${leadId}/meeting/`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return djangoJson(r);
  }

  const scheduledAt = String(body?.scheduledAt ?? "").trim();
  const attendee = String(body?.attendee ?? "").trim();
  if (!scheduledAt || !attendee) {
    return NextResponse.json(
      { detail: "A date/time and an attendee are required" },
      { status: 400 },
    );
  }

  const lead = getLead(leadId);
  if (!lead) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(
    bookMeeting(
      leadId,
      {
        scheduledAt,
        durationMins: Number(body?.durationMins) || 30,
        attendee,
        location: String(body?.location ?? ""),
        notes: typeof body?.notes === "string" ? body.notes : undefined,
      },
      user.name,
    ),
  );
}
