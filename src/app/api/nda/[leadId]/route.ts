import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { leadId } = await params;

  const r = await djangoFetch(`/nda/${leadId}/`);
  return djangoJson(r);
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

  // v3: NDA is keyed by NDA-record id; prepare/send/sign/decline/expire via
  // POST /nda/{id}/{action}/. (The [leadId] param carries the record id at cutover.)
  const r = await djangoFetch(`/nda/${leadId}/${action}/`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return djangoJson(r);
}
