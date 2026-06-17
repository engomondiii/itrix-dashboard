import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import { listNda } from "@/mocks/ndaDb";

export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  if (!siteConfig.useMocks) {
    const r = await djangoFetch("/nda/");
    return NextResponse.json(await r.json(), { status: r.status });
  }
  const results = listNda();
  return NextResponse.json({ results, count: results.length });
}
