import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import { getPoC, setPoCStatus } from "@/mocks/dealsDb";
import { POC_STATUSES, type PoCStatus } from "@/types/poc";

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

/** Update a PoC's status. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ pocId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { pocId } = await params;
  const body = await req.json().catch(() => ({}));

  if (!siteConfig.useMocks) {
    // v3: PoC update endpoint
    const r = await djangoFetch(`/pocs/${pocId}/`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return NextResponse.json(await r.json(), { status: r.status });
  }

  const status = String(body?.status ?? "");
  if (!(POC_STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json({ detail: "Invalid status" }, { status: 400 });
  }
  const poc = setPoCStatus(pocId, status as PoCStatus);
  if (!poc) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(poc);
}
