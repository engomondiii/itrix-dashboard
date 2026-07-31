import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { SESSION_COOKIE } from "@/lib/server/session";

const cookieOpts = {
  httpOnly: true as const,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // Proxy to Django; store the returned JWT access token in the cookie. There
  // is no mock branch: a junk login is rejected by the backend or not at all.
  const r = await fetch(`${siteConfig.djangoApiUrl}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) return NextResponse.json(data, { status: r.status });

  const res = NextResponse.json({ user: data.user, ok: true });
  if (data.access) res.cookies.set(SESSION_COOKIE, data.access, cookieOpts);
  return res;
}
