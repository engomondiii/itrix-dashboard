import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson, notImplementedOnBackend } from "@/lib/server/proxy";
import { inviteMember, listTeam } from "@/mocks/teamDb";
import { ROLES, type Role } from "@/constants/roles";

export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  if (!siteConfig.useMocks) {
    const r = await djangoFetch("/team/");
    return djangoJson(r);
  }
  return NextResponse.json(listTeam());
}

/** Invite a new team member. */
export async function POST(req: Request) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));

  if (!siteConfig.useMocks) {
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

  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim();
  const role = String(body?.role ?? "");
  if (!name || !email || !(ROLES as readonly string[]).includes(role)) {
    return NextResponse.json({ detail: "Invalid member" }, { status: 400 });
  }
  return NextResponse.json(inviteMember({ name, email, role: role as Role }), {
    status: 201,
  });
}
