import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import { MOCK_TEMPLATES } from "@/mocks/templatesDb";

export async function GET(req: Request) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const kind = searchParams.get("kind");

  if (!siteConfig.useMocks) {
    const r = await djangoFetch(`/templates/?${searchParams}`);
    return NextResponse.json(await r.json(), { status: r.status });
  }

  const results = kind ? MOCK_TEMPLATES.filter((t) => t.kind === kind) : MOCK_TEMPLATES;
  return NextResponse.json({ results, count: results.length });
}
