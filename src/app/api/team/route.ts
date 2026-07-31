import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson, notImplementedOnBackend } from "@/lib/server/proxy";

export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const r = await djangoFetch("/team/");
  return djangoJson(r);
}

/** Invite a new team member. */
export async function POST() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  // v3: team invite endpoint — AGREED, NOT YET BUILT.
  //
  // The roster is dashboard-managed (decided 22 Jul 2026). `TeamMemberViewSet`
  // has no `CreateModelMixin` and its `http_method_names` exclude `post`, so
  // forwarding returns a bare DRF 405. Degrade explicitly until it lands.
  //
  // Open at cutover: inviting creates a `User`, and the backend carries both
  // an auth `role` and a display `team_role` — this payload sends one `role`.
  // Confirm which it sets before trusting it. See BACKEND_GAPS.md.
  //
  // RESTORE the `djangoFetch` forward at cutover — SCAFFOLD_PLAN.md §9.
  return notImplementedOnBackend("Inviting a team member", "POST /team/");
}
