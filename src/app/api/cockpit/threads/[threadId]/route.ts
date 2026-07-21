import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { getThread } from "@/mocks/threadsDb";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { threadId } = await params;

  if (!siteConfig.useMocks) {
    // v6: GET cockpit/threads/{id}/ — transcript + coverage + stop_reason.
    const r = await djangoFetch(`/cockpit/threads/${threadId}/`);
    return djangoJson(r);
  }

  const detail = getThread(threadId);
  if (!detail) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(detail);
}
