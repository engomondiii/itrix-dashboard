import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { getThread } from "@/mocks/conversationsDb";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { conversationId } = await params;

  if (!siteConfig.useMocks) {
    // v3: conversation thread (team view) — GET conversations/{id}/
    const r = await djangoFetch(`/conversations/${conversationId}/`);
    return djangoJson(r);
  }

  const thread = getThread(conversationId);
  if (!thread) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(thread);
}
