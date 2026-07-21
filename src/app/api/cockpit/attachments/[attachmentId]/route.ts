import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { notImplementedOnBackend } from "@/lib/server/proxy";
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
    return notImplementedOnBackend(
      "Attachment detail",
      "GET cockpit/attachments/{id}/ on the team plane",
    );
  }

  const attachment = getAttachment(attachmentId);
  if (!attachment) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(attachment);
}
