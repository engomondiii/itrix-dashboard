import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import { getNotificationPrefs, setNotificationPrefs } from "@/mocks/settingsDb";
import type { NotificationPrefs } from "@/types/settings";

export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  if (!siteConfig.useMocks) {
    // v3: notification preferences endpoint
    const r = await djangoFetch("/settings/notifications/");
    return NextResponse.json(await r.json(), { status: r.status });
  }
  return NextResponse.json(getNotificationPrefs());
}

export async function PATCH(req: Request) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as Partial<NotificationPrefs>;

  if (!siteConfig.useMocks) {
    // v3: notification preferences update endpoint
    const r = await djangoFetch("/settings/notifications/", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return NextResponse.json(await r.json(), { status: r.status });
  }
  return NextResponse.json(setNotificationPrefs(body));
}
