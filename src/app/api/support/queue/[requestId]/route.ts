import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { notImplementedOnBackend } from "@/lib/server/proxy";
import { getSupportRequest } from "@/mocks/supportDb";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ requestId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { requestId } = await params;

  if (!siteConfig.useMocks) {
    return notImplementedOnBackend(
      "A support request",
      "GET support/queue/{id}/ on the team plane",
    );
  }

  const request = getSupportRequest(requestId);
  if (!request) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(request);
}
