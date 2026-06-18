import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import {
  declineNda,
  expireNda,
  getNda,
  prepareNda,
  sendNda,
  signNda,
} from "@/mocks/ndaDb";
import { NDA_DOC_TYPES, type NDADocType } from "@/types/nda";

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
    return djangoJson(r);
  }
  const nda = getNda(leadId);
  if (!nda) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(nda);
}

/** Advance/edit an NDA: { action: "prepare" | "send" | "sign" | "decline" | "expire" }. */
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
  const action = ["prepare", "decline", "expire", "send"].includes(body?.action)
    ? body.action
    : "sign";

  if (!siteConfig.useMocks) {
    // v3: NDA is keyed by NDA-record id; prepare/send/sign/decline/expire via
    // POST /nda/{id}/{action}/. (The [leadId] param carries the record id at cutover.)
    const r = await djangoFetch(`/nda/${leadId}/${action}/`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return djangoJson(r);
  }

  if (action === "prepare") {
    const docType = NDA_DOC_TYPES.includes(body?.docType)
      ? (body.docType as NDADocType)
      : undefined;
    const nda = prepareNda(leadId, {
      docType,
      body: typeof body?.body === "string" ? body.body : undefined,
      signerName: typeof body?.signerName === "string" ? body.signerName : undefined,
      signerEmail: typeof body?.signerEmail === "string" ? body.signerEmail : undefined,
    });
    if (!nda) return NextResponse.json({ detail: "Not found" }, { status: 404 });
    return NextResponse.json(nda);
  }

  if (action === "send") {
    const signerEmail = String(body?.signerEmail ?? "").trim();
    if (!signerEmail) {
      return NextResponse.json(
        { detail: "A signer email is required to send the NDA" },
        { status: 400 },
      );
    }
    const nda = sendNda(leadId, {
      signerEmail,
      signerName: typeof body?.signerName === "string" ? body.signerName : undefined,
    });
    if (!nda) return NextResponse.json({ detail: "Not found" }, { status: 404 });
    return NextResponse.json(nda);
  }

  if (action === "decline") {
    const reason = String(body?.reason ?? "").trim();
    if (!reason) {
      return NextResponse.json({ detail: "A decline reason is required" }, { status: 400 });
    }
    const nda = declineNda(leadId, reason);
    if (!nda) return NextResponse.json({ detail: "Not found" }, { status: 404 });
    return NextResponse.json(nda);
  }

  const nda = action === "expire" ? expireNda(leadId) : signNda(leadId, user.name);
  if (!nda) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(nda);
}
