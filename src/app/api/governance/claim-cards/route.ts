import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { canAdminGovernance } from "@/constants/permissions";
import { claimCardKeyExists, createClaimCard, listClaimCards } from "@/mocks/claimCardsDb";

export async function GET(req: Request) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);

  if (!siteConfig.useMocks) {
    // v3: claim-card list — GET governance/claim-cards/
    const r = await djangoFetch(`/governance/claim-cards/?${searchParams}`);
    return djangoJson(r);
  }

  const level = searchParams.get("level");
  return NextResponse.json(listClaimCards(level ? Number(level) : undefined));
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

  if (!siteConfig.useMocks) {
    // v3: claim-card create — POST governance/claim-cards/
    const r = await djangoFetch(`/governance/claim-cards/`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return djangoJson(r);
  }

  if (!body?.key || !body?.title || !body?.approvedWording) {
    return NextResponse.json({ detail: "key, title and approvedWording are required." }, { status: 400 });
  }
  if (claimCardKeyExists(body.key)) {
    return NextResponse.json(
      { detail: `A claim card with key "${body.key}" already exists.` },
      { status: 409 },
    );
  }
  const card = createClaimCard(
    {
      key: body.key,
      title: body.title,
      approvedWording: body.approvedWording,
      claimLevel: body.claimLevel ?? 1,
      isActive: body.isActive,
      notes: body.notes,
    },
    user.name,
  );
  return NextResponse.json(card, { status: 201 });
}
