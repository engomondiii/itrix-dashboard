import "server-only";

import { cookies } from "next/headers";

import { siteConfig } from "@/config/site.config";
import { MOCK_USERS, DEFAULT_USER_EMAIL } from "@/mocks/users";
import type { SessionUser } from "@/types/auth";

export const SESSION_COOKIE = "itrix_session";

/**
 * Resolve the current session user (server-side).
 * Mock mode: cookie holds `mock:<email>`.
 * Real mode: cookie holds the Django JWT; we proxy to /auth/me to resolve it.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  if (siteConfig.useMocks) {
    if (!token.startsWith("mock:")) return null;
    const email = token.slice(5);
    return MOCK_USERS[email] ?? MOCK_USERS[DEFAULT_USER_EMAIL] ?? null;
  }

  try {
    const r = await fetch(`${siteConfig.djangoApiUrl}/auth/me/`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!r.ok) return null;
    const data = await r.json();
    return (data.user ?? data) as SessionUser;
  } catch {
    return null;
  }
}
