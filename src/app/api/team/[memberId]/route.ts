import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { removeMember, updateMember } from "@/mocks/teamDb";
import { ROLES, type Role } from "@/constants/roles";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ memberId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { memberId } = await params;
  const body = await req.json().catch(() => ({}));

  if (!siteConfig.useMocks) {
    // v3: team member update endpoint
    const r = await djangoFetch(`/team/${memberId}/`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return djangoJson(r);
  }

  const rawRole = body?.role != null ? String(body.role) : undefined;
  const role =
    rawRole && (ROLES as readonly string[]).includes(rawRole)
      ? (rawRole as Role)
      : undefined;
  const member = updateMember(memberId, {
    name: body?.name,
    email: body?.email,
    role,
    active: body?.active,
  });
  if (!member) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(member);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ memberId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { memberId } = await params;

  if (!siteConfig.useMocks) {
    // v3: team member remove endpoint
    const r = await djangoFetch(`/team/${memberId}/`, { method: "DELETE" });
    return NextResponse.json(await r.json().catch(() => ({})), { status: r.status });
  }

  if (!removeMember(memberId)) {
    return NextResponse.json({ detail: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
