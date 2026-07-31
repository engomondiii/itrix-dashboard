import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { canAdminGovernance } from "@/constants/permissions";

const ACTIONS = new Set(["quarantine", "release"]);

/**
 * Quarantine or release an attachment.
 *
 * ROLE-GATED. Attachment release is an ADMIN / ASSESSMENT action (Surface 2
 * v5.0 §08) — releasing a file that a scanner flagged puts it back within reach
 * of the agent layer, so it is not a VIEWER's call. The backend re-checks; this
 * gate exists so the UI never offers an action that will be refused.
 *
 * A RELEASE ALWAYS CARRIES A REASON. That is enforced here rather than only in
 * the dialog, because the reason is what the audit entry is for — a release
 * with an empty reason is an unexplained decision to trust a flagged file.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ attachmentId: string; action: string }> },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  if (!canAdminGovernance(user.role)) {
    return NextResponse.json(
      { detail: "Quarantine and release are restricted to Admin / Assessment Team." },
      { status: 403 },
    );
  }

  const { attachmentId, action } = await params;
  if (!ACTIONS.has(action)) {
    return NextResponse.json({ detail: "Unknown action" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));

  const r = await djangoFetch(`/cockpit/attachments/${attachmentId}/${action}/`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return djangoJson(r);
}
