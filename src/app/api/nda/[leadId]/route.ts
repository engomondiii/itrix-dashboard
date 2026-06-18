import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import { declineNda, expireNda, getNda, signNda } from "@/mocks/ndaDb";

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

/** Advance an NDA: { action: "sign" | "decline" | "expire" } (default sign). */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { leadId } = await params;
  const body = await req.json().catch(() => ({}));
  const action = body?.action === "decline" || body?.action === "expire" ? body.action : "sign";

  if (!siteConfig.useMocks) {
    // v3: NDA is keyed by NDA-record id; sign/decline/expire via POST /nda/{id}/{action}/.
    // (The [leadId] route param carries the NDA record id at cutover.)
    const r = await djangoFetch(`/nda/${leadId}/${action}/`, { method: "POST" });
    return NextResponse.json(await r.json(), { status: r.status });
  }

  const nda =
    action === "decline"
      ? declineNda(leadId)
      : action === "expire"
        ? expireNda(leadId)
        : signNda(leadId, user.name);
  if (!nda) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(nda);
}
