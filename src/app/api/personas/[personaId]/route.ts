import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ personaId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { personaId } = await params;

  // v6: GET personas/{id}/ (team)
  const r = await djangoFetch(`/personas/${personaId}/`);
  return djangoJson(r);
}
