import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ templateId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { templateId } = await params;
  const r = await djangoFetch(`/templates/${templateId}/`);
  return djangoJson(r);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ templateId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { templateId } = await params;
  const body = await req.json().catch(() => ({}));

  // v3: template update endpoint
  const r = await djangoFetch(`/templates/${templateId}/`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return djangoJson(r);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ templateId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { templateId } = await params;

  // v3: template delete endpoint
  const r = await djangoFetch(`/templates/${templateId}/`, { method: "DELETE" });
  return NextResponse.json(await r.json().catch(() => ({})), { status: r.status });
}
