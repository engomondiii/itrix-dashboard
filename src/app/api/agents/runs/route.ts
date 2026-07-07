import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { listAgentRuns } from "@/mocks/agentRunsDb";

export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  if (!siteConfig.useMocks) {
    // Real: agent-run audit — GET agents/runs/
    const r = await djangoFetch(`/agents/runs/`);
    return djangoJson(r);
  }

  return NextResponse.json(listAgentRuns());
}
