import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import { logEmailSent } from "@/mocks/leadsDb";

/**
 * Queue an outbound email. Mock mode acknowledges the send; real mode proxies
 * to Django, which dispatches via the configured provider (Resend) at cutover.
 */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));

  if (!siteConfig.useMocks) {
    // v3: outbound email send endpoint
    const r = await djangoFetch("/emails/send/", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json(await r.json(), { status: r.status });
  }

  const subject = String(body?.subject ?? "").trim();
  const text = String(body?.body ?? "").trim();
  if (!subject || !text) {
    return NextResponse.json({ detail: "Subject and body are required" }, { status: 400 });
  }
  // Record the touch on the lead's timeline so the team has an audit trail.
  const leadId = typeof body?.leadId === "string" ? body.leadId : null;
  if (leadId) logEmailSent(leadId, subject, user.name);
  return NextResponse.json({ ok: true, queued: true });
}
