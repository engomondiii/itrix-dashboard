import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { getMigrationReport } from "@/mocks/journeyDb";

/**
 * The ENGAGED-split migration dry run.
 *
 * READ-ONLY BY DESIGN. There is no POST here and there must not be: applying
 * the migration is a backend management command run deliberately by an
 * operator with database access, not a button in a CRM. This endpoint exists so
 * the proposal can be reviewed first.
 */
export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  if (!siteConfig.useMocks) {
    // v6: GET journey/migration-report/ — output of `journey_migration_report`.
    const r = await djangoFetch("/journey/migration-report/");
    return djangoJson(r);
  }

  return NextResponse.json(getMigrationReport());
}
