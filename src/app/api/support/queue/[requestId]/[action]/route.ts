import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import {
  assignSupportRequest,
  escalateSupportRequest,
  resolveSupportRequest,
} from "@/mocks/supportDb";

const ACTIONS = new Set(["assign", "resolve", "escalate"]);

/**
 * Assign, resolve or escalate a support request.
 *
 * Not role-gated beyond authentication: answering support is the job, and
 * putting an approval step between an operator and a customer who is waiting
 * would be the wrong trade. The one thing that IS gated is content — a
 * resolution passes the same governance pass as any other team→customer
 * message, and a support question may never be answered with a commercial
 * claim (enforced in the backend claim checker).
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ requestId: string; action: string }> },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const { requestId, action } = await params;
  if (!ACTIONS.has(action)) {
    return NextResponse.json({ detail: "Unknown action" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));

  if (!siteConfig.useMocks) {
    // v6: POST support/queue/{id}/{assign|resolve|escalate}/
    const r = await djangoFetch(`/support/queue/${requestId}/${action}/`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return djangoJson(r);
  }

  const outcome =
    action === "assign"
      ? assignSupportRequest(requestId, String(body?.owner ?? user.name ?? user.email))
      : action === "escalate"
        ? escalateSupportRequest(requestId, String(body?.reason ?? ""))
        : resolveSupportRequest(requestId, String(body?.resolution ?? ""));

  if (!outcome.ok) {
    return NextResponse.json({ detail: outcome.detail }, { status: outcome.status });
  }
  return NextResponse.json(outcome.request);
}
