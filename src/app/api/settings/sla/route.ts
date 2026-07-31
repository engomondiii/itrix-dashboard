import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import type { SlaConfig } from "@/types/settings";

export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  // v3: SLA configuration endpoint
  const r = await djangoFetch("/settings/sla/");
  return djangoJson(r);
}

export async function PATCH(req: Request) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as Partial<SlaConfig>;

  // v3: SLA configuration update endpoint
  const r = await djangoFetch("/settings/sla/", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return djangoJson(r);
}
