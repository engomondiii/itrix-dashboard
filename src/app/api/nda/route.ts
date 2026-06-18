import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { listNda } from "@/mocks/ndaDb";

export async function GET(req: Request) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  if (!siteConfig.useMocks) {
    const r = await djangoFetch(`/nda/?${searchParams}`);
    return djangoJson(r);
  }
  return NextResponse.json(
    listNda({
      status: searchParams.get("status") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 25),
    }),
  );
}
