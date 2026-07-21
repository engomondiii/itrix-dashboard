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
 *
 * Django normalises every error to a `{ error: { detail, code, fields } }`
 * envelope (apps/core/exceptions.py), but the dashboard's client reads a flat
 * `{ detail, code, fields }` (see `types/api.ts` → ApiError). So on a non-OK
 * response we lift the envelope to that flat shape — otherwise backend error
 * messages would surface to the user as a generic "Request failed (NNN)".
 */
export async function djangoJson(r: Response) {
  const text = await r.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { detail: text || "Upstream request failed" };
  }
  if (!r.ok && data && typeof data === "object" && "error" in data) {
    const inner = (data as { error: unknown }).error;
    if (inner && typeof inner === "object") data = inner;
  }
  return NextResponse.json(data, { status: r.status });
}

/**
 * Declare that a route has no counterpart on the connected backend.
 *
 * Surface 2 v5.0 specifies a team-plane RESOURCE for each of its new areas —
 * a thread list, an attachment review queue, a support queue, a customer list.
 * The shipped backend (v6.0 Phase 3) mounts team-plane AGGREGATES at those
 * names instead: `cockpit/threads/` is conversation metrics, not a list of
 * threads; `cockpit/attachments/` is volume and quarantine rates, not a queue
 * of files. The resources simply are not there yet.
 *
 * WHY 501 AND NOT A PASSTHROUGH 404. A 404 is indistinguishable from "this
 * lead does not exist", so it surfaces as a generic failure and an operator
 * cannot tell a missing record from a missing feature. 501 says precisely what
 * is true — the surface is built, the backend route is not — and
 * `unimplemented: true` lets the client render an honest empty state instead of
 * an error. It also stops the request being made at all, which is why the
 * network tab stops filling with red rows.
 *
 * Each call names the endpoint the backend would need to expose, so closing the
 * gap is a grep away: `rg "notImplementedOnBackend" src/app/api`.
 */
export function notImplementedOnBackend(what: string, expectedEndpoint: string) {
  return NextResponse.json(
    {
      detail: `${what} is not served by the connected backend yet.`,
      unimplemented: true,
      expectedEndpoint,
    },
    { status: 501 },
  );
}
