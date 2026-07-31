import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { canAdminGovernance } from "@/constants/permissions";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ cardId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { cardId } = await params;

  // v3: claim-card detail — GET governance/claim-cards/{id}/
  const r = await djangoFetch(`/governance/claim-cards/${cardId}/`);
  return djangoJson(r);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ cardId: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  if (!canAdminGovernance(user.role)) {
    return NextResponse.json(
      { detail: "You do not have permission to edit claim cards." },
      { status: 403 },
    );
  }
  const { cardId } = await params;
  const body = await req.json().catch(() => ({}));

  // v3: claim-card update — PATCH governance/claim-cards/{id}/
  const r = await djangoFetch(`/governance/claim-cards/${cardId}/`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return djangoJson(r);
}
