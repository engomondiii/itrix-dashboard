import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import {
  completeTask,
  dismissTask,
  rescheduleTask,
  snoozeTask,
} from "@/mocks/followUpDb";

type FollowUpAction = "complete" | "snooze" | "dismiss" | "reschedule";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { taskId } = await params;
  const body = await req.json().catch(() => ({}));
  const action = body?.action as FollowUpAction | undefined;

  if (!siteConfig.useMocks) {
    // v3: POST /follow-up/{id}/{complete|snooze|dismiss|reschedule}/
    const sub: FollowUpAction = action ?? "complete";
    const payload =
      sub === "snooze"
        ? JSON.stringify({ hours: body?.hours ?? 24 })
        : sub === "reschedule"
          ? JSON.stringify({ dueAt: body?.dueAt })
          : undefined;
    const r = await djangoFetch(`/follow-up/${taskId}/${sub}/`, {
      method: "POST",
      body: payload,
    });
    return NextResponse.json(await r.json(), { status: r.status });
  }

  let task;
  switch (action) {
    case "snooze":
      task = snoozeTask(taskId, body?.hours ?? 24);
      break;
    case "dismiss":
      task = dismissTask(taskId);
      break;
    case "reschedule":
      if (typeof body?.dueAt !== "string") {
        return NextResponse.json({ detail: "dueAt is required" }, { status: 400 });
      }
      task = rescheduleTask(taskId, body.dueAt);
      break;
    default:
      task = completeTask(taskId);
  }

  if (!task) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(task);
}
