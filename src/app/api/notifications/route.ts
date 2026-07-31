import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";

export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const r = await djangoFetch("/notifications/");
  return djangoJson(r);
}

/** Mark every notification read. */
export async function PATCH() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  // v3: notifications read-all write endpoint
  const r = await djangoFetch("/notifications/read-all/", { method: "POST" });
  return NextResponse.json(await r.json().catch(() => ({})), { status: r.status });
}
