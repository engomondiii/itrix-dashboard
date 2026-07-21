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

  /**
   * MOCK BRANCH — accepts ANY credentials and mints an ADMIN session.
   *
   * `siteConfig.useMocks` is already opt-in-by-exact-value AND force-disabled in
   * production builds. The second `NODE_ENV` test here is deliberate belt-and-
   * braces on the one route where getting it wrong means "a junk login is
   * accepted in production": if the config guard is ever loosened by a future
   * edit, this branch still cannot execute in a production build.
   *
   * Surface 2 v5.0 §06 Phase 1 / §10 — acceptance: "A junk login is rejected in
   * a production build. Setting the mock flag at runtime does not re-enable it."
   */
  if (siteConfig.useMocks && process.env.NODE_ENV !== "production") {
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
