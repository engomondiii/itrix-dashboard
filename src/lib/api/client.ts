/** Minimal typed fetch helpers for the Next proxy API (client-side). */

export type QueryParams = Record<string, string | number | boolean | undefined | null>;

function withQuery(url: string, params?: QueryParams): string {
  if (!params) return url;
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== "") sp.set(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `${url}?${qs}` : url;
}

/**
 * Thrown when the surface is built but the backend route is not (HTTP 501 from
 * `notImplementedOnBackend`).
 *
 * A distinct type rather than a message string, because the UI has to treat it
 * differently from a failure: "the backend has not shipped this yet" is a
 * normal state of an in-progress cutover, and rendering it as an error trains
 * operators to ignore real errors.
 */
export class NotImplementedOnBackendError extends Error {
  readonly expectedEndpoint?: string;

  constructor(detail: string, expectedEndpoint?: string) {
    super(detail);
    this.name = "NotImplementedOnBackendError";
    this.expectedEndpoint = expectedEndpoint;
  }
}

export function isNotImplemented(error: unknown): error is NotImplementedOnBackendError {
  return error instanceof NotImplementedOnBackendError;
}

async function parse<T>(r: Response): Promise<T> {
  if (!r.ok) {
    const body = await r.json().catch(() => ({}));
    if (r.status === 501 && body?.unimplemented) {
      throw new NotImplementedOnBackendError(body.detail, body.expectedEndpoint);
    }
    throw new Error(body?.detail ?? `Request failed (${r.status})`);
  }
  return r.json() as Promise<T>;
}

export async function apiGet<T>(url: string, params?: QueryParams): Promise<T> {
  return parse<T>(await fetch(withQuery(url, params), { cache: "no-store" }));
}

export async function apiSend<T>(
  url: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<T> {
  return parse<T>(
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body != null ? JSON.stringify(body) : undefined,
    }),
  );
}
