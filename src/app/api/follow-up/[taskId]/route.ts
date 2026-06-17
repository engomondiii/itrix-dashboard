import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import { completeTask, snoozeTask } from "@/mocks/followUpDb";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { taskId } = await params;
  const body = await req.json().catch(() => ({}));
  const action = body?.action as "complete" | "snooze" | undefined;

  if (!siteConfig.useMocks) {
    // v3: POST /follow-up/{id}/complete/ or /follow-up/{id}/snooze/
    const sub = action === "snooze" ? "snooze" : "complete";
    const r = await djangoFetch(`/follow-up/${taskId}/${sub}/`, {
      method: "POST",
      body: sub === "snooze" ? JSON.stringify({ hours: body?.hours ?? 24 }) : undefined,
    });
    return NextResponse.json(await r.json(), { status: r.status });
  }

  const task =
    action === "snooze"
      ? snoozeTask(taskId, body?.hours ?? 24)
      : completeTask(taskId);

  if (!task) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(task);
}
