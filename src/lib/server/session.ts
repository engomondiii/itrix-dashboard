import "server-only";

import { cookies } from "next/headers";

import { siteConfig } from "@/config/site.config";
import type { SessionUser } from "@/types/auth";

export const SESSION_COOKIE = "itrix_session";

/**
 * Resolve the current session user (server-side). The cookie holds the Django
 * JWT; we proxy to /auth/me to resolve it — the backend is the only authority
 * on who a session belongs to.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

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
