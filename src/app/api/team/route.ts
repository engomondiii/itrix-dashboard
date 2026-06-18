import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import { inviteMember, listTeam } from "@/mocks/teamDb";
import { ROLES, type Role } from "@/constants/roles";

export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  if (!siteConfig.useMocks) {
    const r = await djangoFetch("/team/");
    return NextResponse.json(await r.json(), { status: r.status });
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
    // v3: team invite endpoint
    const r = await djangoFetch("/team/", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json(await r.json(), { status: r.status });
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
