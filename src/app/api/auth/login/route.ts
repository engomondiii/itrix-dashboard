import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { SESSION_COOKIE } from "@/lib/server/session";
import { MOCK_USERS, DEFAULT_USER_EMAIL } from "@/mocks/users";

const cookieOpts = {
  httpOnly: true as const,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body?.email ?? "").toLowerCase();

  // Mock mode: accept any credentials; resolve to a known mock user.
  if (siteConfig.useMocks) {
    const user = MOCK_USERS[email] ?? MOCK_USERS[DEFAULT_USER_EMAIL];
    const res = NextResponse.json({ user, ok: true });
    res.cookies.set(SESSION_COOKIE, `mock:${user.email}`, cookieOpts);
    return res;
  }

  // Real mode: proxy to Django; store returned JWT access token in the cookie.
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
