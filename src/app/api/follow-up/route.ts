import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";

export async function GET(req: Request) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter"); // overdue | today | undefined

  // v3: separate paths GET /follow-up/, /follow-up/overdue/, /follow-up/today/
  const path =
    filter === "overdue"
      ? "/follow-up/overdue/"
      : filter === "today"
        ? "/follow-up/today/"
        : "/follow-up/";
  const r = await djangoFetch(path);
  return djangoJson(r);
}
