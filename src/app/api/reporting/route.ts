import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";

export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const r = await djangoFetch("/reporting/");
  return djangoJson(r);
}

/** Generate a new monthly report. */
export async function POST(req: Request) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));

  // v3: report generate endpoint
  const r = await djangoFetch("/reporting/generate/", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return djangoJson(r);
}
