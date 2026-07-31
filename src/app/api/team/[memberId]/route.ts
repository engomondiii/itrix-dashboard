import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson, notImplementedOnBackend } from "@/lib/server/proxy";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ memberId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { memberId } = await params;
  const body = await req.json().catch(() => ({}));

  // v3: team member update endpoint
  const r = await djangoFetch(`/team/${memberId}/`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return djangoJson(r);
}

export async function DELETE() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  // v3: team member remove endpoint — AGREED, NOT YET BUILT.
  //
  // The roster is dashboard-managed (decided 22 Jul 2026), so this route is
  // correct and it is the backend that has to catch up: `TeamMemberViewSet`
  // has no `DestroyModelMixin` and its `http_method_names` exclude `delete`,
  // so forwarding returns a bare DRF 405 the UI can only show as a generic
  // failure. Degrade explicitly until the endpoint lands.
  //
  // RESTORE the `djangoFetch` forward when the backend mounts it — BACKEND_GAPS.md.
  return notImplementedOnBackend("Removing a team member", "DELETE /team/{id}/");
}
