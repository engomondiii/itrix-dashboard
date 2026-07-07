import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { canAdminGovernance } from "@/constants/permissions";
import { getClaimCard, updateClaimCard } from "@/mocks/claimCardsDb";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ cardId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { cardId } = await params;

  if (!siteConfig.useMocks) {
    // v3: claim-card detail — GET governance/claim-cards/{id}/
    const r = await djangoFetch(`/governance/claim-cards/${cardId}/`);
    return djangoJson(r);
  }

  const card = getClaimCard(cardId);
  if (!card) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(card);
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

  if (!siteConfig.useMocks) {
    // v3: claim-card update — PATCH governance/claim-cards/{id}/
    const r = await djangoFetch(`/governance/claim-cards/${cardId}/`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return djangoJson(r);
  }

  const card = updateClaimCard(cardId, body);
  if (!card) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(card);
}
