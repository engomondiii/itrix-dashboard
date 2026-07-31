import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { notImplementedOnBackend } from "@/lib/server/proxy";

/**
 * The customer-first next-best-action for one customer.
 *
 * ONE RULE, ONE PLACE. The same `nba_precedence` path serves both the portal
 * and the cockpit (Backend v6.0 §11.1), so a customer and an operator can never
 * see contradictory guidance. This route must never re-rank or filter the
 * result it gets back.
 */
export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  return notImplementedOnBackend(
    "The customer-first next best action",
    "GET/POST cockpit/customers/{id}/next-action/ (the lead-plane NBA is mounted; the customer-plane one is not yet)",
  );
}

/**
 * Record a commercial override.
 *
 * This does NOT clear the suppression. It records that a human chose to act
 * commercially anyway, with their name and their reason. The condition stays
 * visible afterwards, which is the point — an override is an exception on the
 * record, not a way to make the rule go away.
 */
export async function POST() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  return notImplementedOnBackend(
    "Logging a commercial override",
    "POST cockpit/customers/{id}/next-action/ (not mounted yet)",
  );
}
