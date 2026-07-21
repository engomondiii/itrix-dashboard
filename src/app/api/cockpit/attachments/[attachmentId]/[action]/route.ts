import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { notImplementedOnBackend } from "@/lib/server/proxy";
import { canAdminGovernance } from "@/constants/permissions";
import { setAttachmentStatus } from "@/mocks/attachmentsDb";

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
  const reason = String(body?.reason ?? "");

  if (!siteConfig.useMocks) {
    return notImplementedOnBackend(
      "Quarantine and release",
      "POST cockpit/attachments/{id}/{quarantine|release}/",
    );
  }

  const outcome = setAttachmentStatus(
    attachmentId,
    action as "quarantine" | "release",
    user.name ?? user.email,
    reason,
  );
  if (!outcome.ok) {
    return NextResponse.json({ detail: outcome.detail }, { status: outcome.status });
  }
  return NextResponse.json(outcome.attachment);
}
