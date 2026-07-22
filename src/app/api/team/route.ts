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
    // `TeamMemberViewSet` has no `CreateModelMixin` and its `http_method_names`
    // exclude POST, so this would return a bare DRF 405. Inviting a team member
    // creates a `User`, which the backend does not expose over the dashboard
    // API yet. Degrade explicitly — see BACKEND_GAPS.md.
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
