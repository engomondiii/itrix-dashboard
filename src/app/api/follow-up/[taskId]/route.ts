import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";

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
  return djangoJson(r);
}
