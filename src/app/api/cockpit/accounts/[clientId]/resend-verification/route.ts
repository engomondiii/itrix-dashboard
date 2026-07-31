import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { notImplementedOnBackend } from "@/lib/server/proxy";

/**
 * Resend a verification email — an operator action with a REQUIRED reason,
 * logged with the operator's identity and rate-limited server-side per address
 * regardless of who asks (Surface 2 v7.1 §04.9).
 *
 * The reason is enforced HERE, not only in the dialog — the same rule as
 * attachment release and the commercial override. A UI-only requirement
 * disappears the moment somebody calls the endpoint directly.
 *
 * The operator sees that a verification is outstanding. They never see the
 * token: a verification token visible to an operator is an account-takeover
 * primitive with an audit trail attached (§08).
 */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const reason = String(body?.reason ?? "");

  if (!reason.trim()) {
    return NextResponse.json(
      { detail: "A resend requires a reason." },
      { status: 409 },
    );
  }

  return notImplementedOnBackend(
    "Resending a verification email",
    "POST cockpit/accounts/{id}/resend-verification/ (Backend v7.2 Phase 4)",
  );
}
