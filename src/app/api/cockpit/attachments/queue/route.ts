import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { listAttachments } from "@/mocks/attachmentsDb";

/**
 * The attachment review queue — TEAM PLANE ONLY.
 *
 * Everything this returns is internal, and `riskFlags` especially: it is a
 * derived, team-only field that must never appear in any payload this surface
 * sends anywhere else (Surface 2 v5.0 §4.2).
 */
export async function GET(req: Request) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const sp = new URL(req.url).searchParams;

  if (!siteConfig.useMocks) {
    // The shipped backend serves the queue at /cockpit/attachments/ itself —
    // the aggregate moved to analytics/attachments/, so the bare name IS the
    // row-level resource. The shipped name binds.
    const r = await djangoFetch(`/cockpit/attachments/?${sp}`);
    return djangoJson(r);
  }

  const results = listAttachments({
    scan: sp.get("scan") ?? undefined,
    preNdaOnly: sp.get("preNdaOnly") === "true",
    quarantinedOnly: sp.get("quarantinedOnly") === "true",
  });

  return NextResponse.json({ results, count: results.length });
}
