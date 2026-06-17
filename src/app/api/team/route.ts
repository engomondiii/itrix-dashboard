import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import { MOCK_TEAM } from "@/mocks/users";
import { MOCK_LEADS } from "@/mocks/leads";
import type { TeamMember } from "@/types/team";

export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  if (!siteConfig.useMocks) {
    const r = await djangoFetch("/team/");
    return NextResponse.json(await r.json(), { status: r.status });
  }

  const openByOwner = new Map<string, number>();
  for (const l of MOCK_LEADS) {
    if (l.owner && l.status !== "Closed") {
      openByOwner.set(l.owner, (openByOwner.get(l.owner) ?? 0) + 1);
    }
  }

  const results: TeamMember[] = MOCK_TEAM.map((u) => ({
    ...u,
    active: true,
    openLeads: openByOwner.get(u.name) ?? 0,
  }));
  return NextResponse.json({ results, count: results.length });
}
