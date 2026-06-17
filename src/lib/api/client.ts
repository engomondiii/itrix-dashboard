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

async function parse<T>(r: Response): Promise<T> {
  if (!r.ok) {
    const body = await r.json().catch(() => ({}));
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
