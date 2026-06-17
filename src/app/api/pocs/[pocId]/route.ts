import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import { getPoC } from "@/mocks/dealsDb";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ pocId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { pocId } = await params;
  if (!siteConfig.useMocks) {
    const r = await djangoFetch(`/pocs/${pocId}/`);
    return NextResponse.json(await r.json(), { status: r.status });
  }
  const poc = getPoC(pocId);
  if (!poc) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(poc);
}
