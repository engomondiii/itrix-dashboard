import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { canAdminGovernance } from "@/constants/permissions";

export async function GET(req: Request) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);

  // v3: claim-card list — GET governance/claim-cards/
  const r = await djangoFetch(`/governance/claim-cards/?${searchParams}`);
  return djangoJson(r);
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  if (!canAdminGovernance(user.role)) {
    return NextResponse.json(
      { detail: "You do not have permission to create claim cards." },
      { status: 403 },
    );
  }
  const body = await req.json().catch(() => ({}));

  // v3: claim-card create — POST governance/claim-cards/
  const r = await djangoFetch(`/governance/claim-cards/`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return djangoJson(r);
}
