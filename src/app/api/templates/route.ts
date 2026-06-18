import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { createTemplate, listTemplates } from "@/mocks/templatesDb";
import { TEMPLATE_KINDS, type TemplateKind } from "@/types/template";

export async function GET(req: Request) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const kind = searchParams.get("kind");

  if (!siteConfig.useMocks) {
    const r = await djangoFetch(`/templates/?${searchParams}`);
    return djangoJson(r);
  }

  return NextResponse.json(
    listTemplates((kind as TemplateKind) || undefined),
  );
}

/** Create a template. */
export async function POST(req: Request) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));

  if (!siteConfig.useMocks) {
    // v3: template create endpoint
    const r = await djangoFetch("/templates/", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return djangoJson(r);
  }

  const name = String(body?.name ?? "").trim();
  const text = String(body?.body ?? "");
  const kind = String(body?.kind ?? "");
  if (!name || !text.trim() || !(TEMPLATE_KINDS as readonly string[]).includes(kind)) {
    return NextResponse.json({ detail: "Invalid template" }, { status: 400 });
  }
  return NextResponse.json(
    createTemplate({ name, body: text, kind: kind as TemplateKind }),
    { status: 201 },
  );
}
