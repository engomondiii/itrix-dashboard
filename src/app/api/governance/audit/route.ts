import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { listAllApprovals } from "@/mocks/approvalsDb";

export async function GET(req: Request) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);

  if (!siteConfig.useMocks) {
    // v3: governance audit — GET governance/audit/
    const r = await djangoFetch(`/governance/audit/?${searchParams}`);
    return djangoJson(r);
  }

  const status = searchParams.get("status") ?? undefined;
  return NextResponse.json(listAllApprovals(status));
}
