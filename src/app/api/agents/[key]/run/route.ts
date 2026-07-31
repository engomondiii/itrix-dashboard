import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { canAdminGovernance } from "@/constants/permissions";
import { AGENT_KEYS } from "@/constants/agentKeys";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  // Invoking agents is an operator (ASSESSMENT+) action; results still pass governance.
  if (!canAdminGovernance(user.role)) {
    return NextResponse.json(
      { detail: "You do not have permission to run agents." },
      { status: 403 },
    );
  }
  const { key } = await params;
  if (!(AGENT_KEYS as readonly string[]).includes(key)) {
    return NextResponse.json({ detail: "Unknown agent." }, { status: 404 });
  }
  const body = await req.json().catch(() => ({}));

  // v3: invoke an agent — POST agents/{key}/run/
  const r = await djangoFetch(`/agents/${key}/run/`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return djangoJson(r);
}
