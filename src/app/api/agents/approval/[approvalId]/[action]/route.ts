import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { canAdminGovernance } from "@/constants/permissions";

const ACTIONS = ["approve", "edit", "reject"] as const;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ approvalId: string; action: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  // Mirror the backend IsGovernanceAdmin gate (ADMIN/ASSESSMENT).
  if (!canAdminGovernance(user.role)) {
    return NextResponse.json(
      { detail: "You do not have permission to act on approvals." },
      { status: 403 },
    );
  }

  const { approvalId, action } = await params;
  if (!(ACTIONS as readonly string[]).includes(action)) {
    return NextResponse.json({ detail: "Unknown action." }, { status: 400 });
  }
  const body = await req.json().catch(() => ({}));

  // v3: approve/edit/reject — POST agents/approval/{id}/{action}/
  const r = await djangoFetch(`/agents/approval/${approvalId}/${action}/`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return djangoJson(r);
}
