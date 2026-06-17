import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import { getNda, signNda } from "@/mocks/ndaDb";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { leadId } = await params;

  if (!siteConfig.useMocks) {
    const r = await djangoFetch(`/nda/${leadId}/`);
    return NextResponse.json(await r.json(), { status: r.status });
  }
  const nda = getNda(leadId);
  if (!nda) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(nda);
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { leadId } = await params;

  if (!siteConfig.useMocks) {
    // v3: NDA is keyed by NDA-record id; sign via POST /nda/{id}/sign/.
    // (The [leadId] route param carries the NDA record id at cutover.)
    const r = await djangoFetch(`/nda/${leadId}/sign/`, { method: "POST" });
    return NextResponse.json(await r.json(), { status: r.status });
  }
  const nda = signNda(leadId);
  if (!nda) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(nda);
}
