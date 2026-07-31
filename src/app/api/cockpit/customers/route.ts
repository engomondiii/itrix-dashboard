import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";

/**
 * The customer health board — TEAM PLANE ONLY.
 *
 * The population starts at FIRST PAYMENT (journey state 7), not at license-out.
 * A paid Assessment customer is a customer, and the backend serializer is the
 * authority on that; this route does not re-decide it.
 *
 * `healthClass` is internal. A customer sees their outcomes and their
 * deployment status — never a grade about themselves.
 */
export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  // v6: GET cockpit/customers/
  const r = await djangoFetch("/cockpit/customers/");
  return djangoJson(r);
}
