import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { getAttachment } from "@/mocks/attachmentsDb";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ attachmentId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { attachmentId } = await params;

  if (!siteConfig.useMocks) {
    // v6: GET cockpit/attachments/{id}/
    const r = await djangoFetch(`/cockpit/attachments/${attachmentId}/`);
    return djangoJson(r);
  }

  const attachment = getAttachment(attachmentId);
  if (!attachment) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(attachment);
}
