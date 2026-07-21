import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { notImplementedOnBackend } from "@/lib/server/proxy";
import { getCustomerNextAction, recordCommercialOverride } from "@/mocks/nbaDb";

/**
 * The customer-first next-best-action for one customer.
 *
 * ONE RULE, ONE PLACE. The same `nba_precedence` path serves both the portal
 * and the cockpit (Backend v6.0 §11.1), so a customer and an operator can never
 * see contradictory guidance. This route must never re-rank or filter the
 * result it gets back.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ clientId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { clientId } = await params;

  if (!siteConfig.useMocks) {
    return notImplementedOnBackend(
      "The customer-first next best action",
      "GET/POST cockpit/customers/{id}/next-action/",
    );
  }

  const nba = getCustomerNextAction(clientId);
  if (!nba) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(nba);
}

/**
 * Record a commercial override.
 *
 * This does NOT clear the suppression. It records that a human chose to act
 * commercially anyway, with their name and their reason. The condition stays
 * visible afterwards, which is the point — an override is an exception on the
 * record, not a way to make the rule go away.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ clientId: string }> },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { clientId } = await params;
  const body = await req.json().catch(() => ({}));
  const reason = String(body?.reason ?? "");

  if (!siteConfig.useMocks) {
    return notImplementedOnBackend(
      "Logging a commercial override",
      "POST cockpit/customers/{id}/next-action/",
    );
  }

  const entry = recordCommercialOverride(clientId, reason, user.name ?? user.email);
  if (!entry) {
    return NextResponse.json(
      { detail: "An override requires a reason." },
      { status: 409 },
    );
  }
  return NextResponse.json(entry);
}
