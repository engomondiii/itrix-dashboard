import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { postTeamMessage } from "@/mocks/conversationsDb";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const { conversationId } = await params;
  const body = await req.json().catch(() => ({}));
  const text = typeof body?.body === "string" ? body.body : "";
  if (!text.trim()) {
    return NextResponse.json({ detail: "Message body is required." }, { status: 400 });
  }

  if (!siteConfig.useMocks) {
    // v3: governed team→client send — POST console/conversations/{id}/message/
    const r = await djangoFetch(`/console/conversations/${conversationId}/message/`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return djangoJson(r);
  }

  const claimLevel = typeof body?.claimLevel === "number" ? body.claimLevel : 1;
  const result = postTeamMessage(conversationId, text, claimLevel);
  if (!result) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(result, { status: 201 });
}
