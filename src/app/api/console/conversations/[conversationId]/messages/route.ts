import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { conversationId } = await params;

  // v3: conversation thread (team view) — GET conversations/{id}/
  const r = await djangoFetch(`/conversations/${conversationId}/`);
  return djangoJson(r);
}
