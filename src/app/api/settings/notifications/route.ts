import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import type { NotificationPrefs } from "@/types/settings";

export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  // v3: notification preferences endpoint
  const r = await djangoFetch("/settings/notifications/");
  return djangoJson(r);
}

export async function PATCH(req: Request) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as Partial<NotificationPrefs>;

  // v3: notification preferences update endpoint
  const r = await djangoFetch("/settings/notifications/", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return djangoJson(r);
}
