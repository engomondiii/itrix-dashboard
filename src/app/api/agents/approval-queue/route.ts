import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { listApprovalQueue } from "@/mocks/approvalsDb";

export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  if (!siteConfig.useMocks) {
    // v3: agent approval queue — GET agents/approval-queue/
    const r = await djangoFetch(`/agents/approval-queue/`);
    return djangoJson(r);
  }

  return NextResponse.json(listApprovalQueue());
}
