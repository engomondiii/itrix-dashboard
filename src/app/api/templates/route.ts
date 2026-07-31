import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";

export async function GET(req: Request) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);

  const r = await djangoFetch(`/templates/?${searchParams}`);
  return djangoJson(r);
}

/** Create a template. */
export async function POST(req: Request) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));

  // v3: template create endpoint
  const r = await djangoFetch("/templates/", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return djangoJson(r);
}
