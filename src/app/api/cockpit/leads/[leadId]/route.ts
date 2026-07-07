import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { getCockpit } from "@/mocks/cockpitDb";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { leadId } = await params;

  if (!siteConfig.useMocks) {
    // v3: cockpit read — GET cockpit/leads/{id}/
    const r = await djangoFetch(`/cockpit/leads/${leadId}/`);
    return djangoJson(r);
  }

  const cockpit = getCockpit(leadId);
  if (!cockpit) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(cockpit);
}
