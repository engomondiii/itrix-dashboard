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
  const cc = typeof body?.cc === "string" ? body.cc : undefined;
  const scheduledAt =
    typeof body?.scheduledAt === "string" && body.scheduledAt ? body.scheduledAt : undefined;
  const attachments = Array.isArray(body?.attachments)
    ? body.attachments.filter((a: unknown): a is string => typeof a === "string")
    : undefined;
  const scheduled = !!scheduledAt && new Date(scheduledAt).getTime() > Date.now();

  // Record the touch on the lead's timeline so the team has an audit trail.
  const leadId = typeof body?.leadId === "string" ? body.leadId : null;
  if (leadId) logEmailSent(leadId, subject, user.name, { cc, scheduledAt, attachments });
  return NextResponse.json({ ok: true, queued: true, scheduled });
}
