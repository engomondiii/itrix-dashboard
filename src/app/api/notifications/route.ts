import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { listNotifications, markAllNotificationsRead } from "@/mocks/notificationsDb";

export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  if (!siteConfig.useMocks) {
    const r = await djangoFetch("/notifications/");
    return djangoJson(r);
  }
  return NextResponse.json(listNotifications());
}

/** Mark every notification read. */
export async function PATCH() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  if (!siteConfig.useMocks) {
    // v3: notifications read-all write endpoint
    const r = await djangoFetch("/notifications/read-all/", { method: "POST" });
    return NextResponse.json(await r.json().catch(() => ({})), { status: r.status });
  }
  return NextResponse.json(markAllNotificationsRead());
}
