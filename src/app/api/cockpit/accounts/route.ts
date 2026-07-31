import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { notImplementedOnBackend } from "@/lib/server/proxy";

/**
 * Accounts · no conversation yet — TEAM PLANE ONLY.
 *
 * The silent self-serve population (Surface 2 v7.1 §04.8). Everything here is
 * excluded from every lead queue, tier count, conversion rate and SLA clock
 * (R70) and appears in exactly this one place. Visible, countable, sortable by
 * age — and deliberately NOT a queue: nothing about this list tells an
 * operator to chase.
 */
export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  return notImplementedOnBackend(
    "Accounts with no conversation yet",
    "GET cockpit/accounts/ (Backend v7.2 Phase 4)",
  );
}
