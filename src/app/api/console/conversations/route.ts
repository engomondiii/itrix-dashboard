import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { listConversations } from "@/mocks/conversationsDb";

export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  if (!siteConfig.useMocks) {
    // v3: console conversation list — GET console/conversations/
    const r = await djangoFetch(`/console/conversations/`);
    return djangoJson(r);
  }

  return NextResponse.json(listConversations());
}
