import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";

/**
 * Queue an outbound email. Proxies
 * to Django, which dispatches via the configured provider (Resend) at cutover.
 */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));

  // v3: outbound email send endpoint
  const r = await djangoFetch("/emails/send/", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return djangoJson(r);
}
