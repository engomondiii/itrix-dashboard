import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { listAllOutcomes } from "@/mocks/customersDb";

/** Every agreed outcome across the book — "are we delivering what we promised?" */
export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  if (!siteConfig.useMocks) {
    // v6: GET cockpit/customers/outcomes/
    const r = await djangoFetch("/cockpit/customers/outcomes/");
    return djangoJson(r);
  }

  const results = listAllOutcomes();
  return NextResponse.json({ results, count: results.length });
}
