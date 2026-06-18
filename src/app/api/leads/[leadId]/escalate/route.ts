import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import { escalate } from "@/mocks/leadsDb";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const { leadId } = await params;
  const body = await req.json().catch(() => ({}));

  if (!siteConfig.useMocks) {
    const r = await djangoFetch(`/leads/${leadId}/escalate/`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json(await r.json(), { status: r.status });
  }

  const reason = String(body?.reason ?? "").trim();
  if (!reason) {
    return NextResponse.json({ detail: "An escalation reason is required" }, { status: 400 });
  }
  const priority = ["normal", "high", "urgent"].includes(body?.priority)
    ? body.priority
    : "normal";

  const lead = escalate(leadId, { reason, priority }, user.name);
  if (!lead) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(lead);
}
