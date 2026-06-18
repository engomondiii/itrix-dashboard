import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { setMilestoneStatus } from "@/mocks/dealsDb";
import { MILESTONE_STATUSES, type MilestoneStatus } from "@/types/poc";

/** Update a PoC milestone's status. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ pocId: string; milestoneId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { pocId, milestoneId } = await params;
  const body = await req.json().catch(() => ({}));

  if (!siteConfig.useMocks) {
    // v3: PoC milestone update endpoint
    const r = await djangoFetch(`/pocs/${pocId}/milestones/${milestoneId}/`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return djangoJson(r);
  }

  const status = String(body?.status ?? "");
  if (!(MILESTONE_STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json({ detail: "Invalid status" }, { status: 400 });
  }
  const poc = setMilestoneStatus(pocId, milestoneId, status as MilestoneStatus);
  if (!poc) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(poc);
}
