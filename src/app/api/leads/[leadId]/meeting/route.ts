import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import { bookMeeting, getLead } from "@/mocks/leadsDb";

/** Book a meeting for a lead (moves status to "Meeting Booked"). */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const { leadId } = await params;

  if (!siteConfig.useMocks) {
    // v3: lead meeting-booking endpoint
    const r = await djangoFetch(`/leads/${leadId}/meeting/`, { method: "POST" });
    return NextResponse.json(await r.json(), { status: r.status });
  }

  const lead = getLead(leadId);
  if (!lead) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(bookMeeting(leadId, user.name));
}
