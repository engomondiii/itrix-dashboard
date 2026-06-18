import "server-only";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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

/**
 * Build a NextResponse from a Django response, preserving its status and
 * tolerating empty or non-JSON bodies (so an upstream 4xx/5xx error isn't
 * turned into an opaque 500 when the body can't be parsed).
 */
export async function djangoJson(r: Response) {
  const text = await r.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { detail: text || "Upstream request failed" };
  }
  return NextResponse.json(data, { status: r.status });
}
