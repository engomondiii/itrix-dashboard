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

/**
 * Endpoints this session has already learned are unimplemented.
 *
 * Whether a backend route exists cannot change while the tab is open, so asking
 * twice is waste. Without this, the topbar queue chips re-ask on every single
 * page navigation and the network tab fills with red rows that all say the same
 * thing — which is exactly what made "the endpoints are still failing" look
 * like an unfixed bug rather than a documented gap.
 *
 * Keyed by route PATTERN rather than concrete URL, on two axes:
 *   · query strings are dropped — the attachment queue is one endpoint whether
 *     or not `?quarantinedOnly=true` is on it;
 *   · id-shaped segments collapse to `:id`, so learning that
 *     `cockpit/leads/{a}/persona` is unimplemented also covers lead {b}. The
 *     route either exists or it does not; it cannot exist for one record.
 */
const UNIMPLEMENTED = new Map<string, NotImplementedOnBackendError>();

/** UUIDs, and the mock stores' `cli_…` / `thr_…` / `att_…` style ids. */
const ID_SEGMENT =
  /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|(?:cli|thr|att|sup|l)[-_].+|\d+)$/i;

function endpointKey(url: string): string {
  return url
    .split("?")[0]
    .split("/")
    .map((seg) => (ID_SEGMENT.test(seg) ? ":id" : seg))
    .join("/");
}

/** Throws the memoised error if this endpoint has already 501'd this session. */
function assertNotKnownUnimplemented(url: string): void {
  const known = UNIMPLEMENTED.get(endpointKey(url));
  if (known) throw known;
}

function rememberUnimplemented(url: string, error: NotImplementedOnBackendError): void {
  UNIMPLEMENTED.set(endpointKey(url), error);
}

/**
 * Exposed for the hand-rolled fetchers that cannot go through `apiGet` — the
 * persona match needs to read a 204, so it does its own `fetch` and has to feed
 * the memo itself. Without this it would be the one endpoint still re-asking on
 * every page.
 */
export function rememberUnimplementedEndpoint(
  url: string,
  error: NotImplementedOnBackendError,
): void {
  rememberUnimplemented(url, error);
}

/** Same escape hatch, for the check side. */
export function throwIfKnownUnimplemented(url: string): void {
  assertNotKnownUnimplemented(url);
}

async function parse<T>(r: Response, url: string): Promise<T> {
  if (!r.ok) {
    const body = await r.json().catch(() => ({}));
    if (r.status === 501 && body?.unimplemented) {
      const error = new NotImplementedOnBackendError(body.detail, body.expectedEndpoint);
      rememberUnimplemented(url, error);
      throw error;
    }
    throw new Error(body?.detail ?? `Request failed (${r.status})`);
  }
  return r.json() as Promise<T>;
}

export async function apiGet<T>(url: string, params?: QueryParams): Promise<T> {
  assertNotKnownUnimplemented(url);
  return parse<T>(await fetch(withQuery(url, params), { cache: "no-store" }), url);
}

export async function apiSend<T>(
  url: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<T> {
  assertNotKnownUnimplemented(url);
  return parse<T>(
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body != null ? JSON.stringify(body) : undefined,
    }),
    url,
  );
}
