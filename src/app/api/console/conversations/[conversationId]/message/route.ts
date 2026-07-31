import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { canAdminGovernance } from "@/constants/permissions";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  // Writing to a client conversation is an elevated action, like running an agent
  // or acting on an approval. The backend governs the message either way.
  if (!canAdminGovernance(user.role)) {
    return NextResponse.json(
      { detail: "You do not have permission to message clients." },
      { status: 403 },
    );
  }
  const { conversationId } = await params;
  const body = await req.json().catch(() => ({}));
  const text = typeof body?.body === "string" ? body.body : "";
  if (!text.trim()) {
    return NextResponse.json({ detail: "Message body is required." }, { status: 400 });
  }

  // v3: governed team→client send — POST console/conversations/{id}/message/
  const r = await djangoFetch(`/console/conversations/${conversationId}/message/`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return djangoJson(r);
}
