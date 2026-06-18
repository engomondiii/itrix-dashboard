import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import { deleteTemplate, getTemplate, updateTemplate } from "@/mocks/templatesDb";
import { TEMPLATE_KINDS, type TemplateKind } from "@/types/template";

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
  const tpl = getTemplate(templateId);
  if (!tpl) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(tpl);
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

  if (!siteConfig.useMocks) {
    // v3: template update endpoint
    const r = await djangoFetch(`/templates/${templateId}/`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return NextResponse.json(await r.json(), { status: r.status });
  }

  const rawKind = body?.kind != null ? String(body.kind) : undefined;
  const kind =
    rawKind && (TEMPLATE_KINDS as readonly string[]).includes(rawKind)
      ? (rawKind as TemplateKind)
      : undefined;
  const tpl = updateTemplate(templateId, {
    name: body?.name,
    body: body?.body,
    kind,
  });
  if (!tpl) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(tpl);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ templateId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { templateId } = await params;

  if (!siteConfig.useMocks) {
    // v3: template delete endpoint
    const r = await djangoFetch(`/templates/${templateId}/`, { method: "DELETE" });
    return NextResponse.json(await r.json().catch(() => ({})), { status: r.status });
  }

  if (!deleteTemplate(templateId)) {
    return NextResponse.json({ detail: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
