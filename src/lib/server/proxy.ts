import "server-only";

import { cookies } from "next/headers";

import { siteConfig } from "@/config/site.config";
import { SESSION_COOKIE } from "@/lib/server/session";

/** Forward a request to Django with the session JWT as a Bearer token. */
export async function djangoFetch(path: string, init?: RequestInit) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return fetch(`${siteConfig.djangoApiUrl}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
  });
}
