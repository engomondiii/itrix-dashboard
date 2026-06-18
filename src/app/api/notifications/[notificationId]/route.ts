import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import { markNotificationRead } from "@/mocks/notificationsDb";

/** Mark a single notification read. */
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ notificationId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { notificationId } = await params;

  if (!siteConfig.useMocks) {
    // v3: per-notification read write endpoint
    const r = await djangoFetch(`/notifications/${notificationId}/read/`, {
      method: "POST",
    });
    return NextResponse.json(await r.json().catch(() => ({})), { status: r.status });
  }
  return NextResponse.json(markNotificationRead(notificationId));
}
