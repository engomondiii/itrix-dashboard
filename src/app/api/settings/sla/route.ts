import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import { getSlaConfig, setSlaConfig } from "@/mocks/settingsDb";
import type { SlaConfig } from "@/types/settings";

export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  if (!siteConfig.useMocks) {
    // v3: SLA configuration endpoint
    const r = await djangoFetch("/settings/sla/");
    return NextResponse.json(await r.json(), { status: r.status });
  }
  return NextResponse.json(getSlaConfig());
}

export async function PATCH(req: Request) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as Partial<SlaConfig>;

  if (!siteConfig.useMocks) {
    // v3: SLA configuration update endpoint
    const r = await djangoFetch("/settings/sla/", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return NextResponse.json(await r.json(), { status: r.status });
  }
  return NextResponse.json(setSlaConfig(body));
}
