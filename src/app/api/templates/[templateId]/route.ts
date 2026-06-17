import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import { MOCK_TEMPLATES } from "@/mocks/templatesDb";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ templateId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { templateId } = await params;
  if (!siteConfig.useMocks) {
    const r = await djangoFetch(`/templates/${templateId}/`);
    return NextResponse.json(await r.json(), { status: r.status });
  }
  const tpl = MOCK_TEMPLATES.find((t) => t.id === templateId);
  if (!tpl) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(tpl);
}
