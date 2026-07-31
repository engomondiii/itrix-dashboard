import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });

  // v3: current-user profile endpoint
  const r = await djangoFetch("/auth/profile/");
  return djangoJson(r);
}

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));

  // v3: profile update endpoint
  const r = await djangoFetch("/auth/profile/", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return djangoJson(r);
}
