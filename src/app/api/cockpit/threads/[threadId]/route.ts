import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { notImplementedOnBackend } from "@/lib/server/proxy";
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
    return notImplementedOnBackend(
      "The thread transcript",
      "GET cockpit/threads/{id}/",
    );
  }

  const detail = getThread(threadId);
  if (!detail) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(detail);
}
