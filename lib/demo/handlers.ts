/**
 * MSW auth handlers for demo mode — a faithful in-browser stand-in for the
 * itriX team-plane auth (itrix-backend `apps/authentication/`): the
 * {error:{detail,code,fields?}} envelope, simplejwt-style rotation, the
 * wrapped `me` vs bare `profile` split, non-enumerating 401s on bad
 * credentials. Sign in with demo@example.com / demo1234.
 *
 * The signed-in flag lives in `sessionStorage`, which is what makes the
 * session-restore flow in `auth-context.tsx` visible in demo mode; nothing
 * outlives the tab. Domain data handlers live in `today.ts`.
 */

import { delay, http, HttpResponse } from 'msw';

import { DEMO_CREDENTIALS, DEMO_USER } from './data';

const SESSION_KEY = 'demo:signed-in';

const signedIn = {
  get: () => sessionStorage.getItem(SESSION_KEY) === '1',
  set: (value: boolean) =>
    value ? sessionStorage.setItem(SESSION_KEY, '1') : sessionStorage.removeItem(SESSION_KEY),
};


// ---------------------------------------------------------------------------
// Envelope helpers — mirror itrix-backend apps/core/exceptions.py exactly:
// { error: { detail, code, fields? } } with fields as a DRF errors dict.
// ---------------------------------------------------------------------------

interface FieldIssue {
  field: string | null;
  code: string | null;
  message: string;
}

function errorEnvelope(
  status: number,
  code: string,
  detail: string,
  fieldIssues: FieldIssue[] = [],
) {
  const fields: Record<string, string[]> = {};
  for (const issue of fieldIssues) {
    const key = issue.field ?? 'non_field_errors';
    (fields[key] ??= []).push(issue.message);
  }
  return HttpResponse.json(
    {
      error: {
        detail,
        code,
        ...(fieldIssues.length ? { fields } : {}),
      },
    },
    { status },
  );
}

function unauthenticated() {
  return errorEnvelope(401, 'not_authenticated', 'Authentication credentials were not provided.');
}

/** Authenticated endpoints require the bearer token the login handler issued. */
function requireAuth(request: Request): Response | null {
  const header = request.headers.get('authorization') ?? '';
  if (!header.startsWith('Bearer demo-access-')) return unauthenticated();
  return null;
}

const AUTH = '*/api/v1/auth';

/** A touch of latency so loading states are visible, not subliminal. */
const LATENCY = 250;

export const handlers = [
  // --- Auth ---------------------------------------------------------------

  // Mirrors itrix-backend apps/authentication/views.py: field-shape problems
  // are a 400 `invalid` with fields; wrong credentials are a 401
  // `invalid_credentials` with NO field attribution (non-enumeration).
  http.post(`${AUTH}/login/`, async ({ request }) => {
    await delay(LATENCY);
    const body = (await request.json()) as { email?: string; password?: string };

    if (!body.email || !body.password) {
      return errorEnvelope(400, 'invalid', 'Validation failed.', [
        ...(body.email ? [] : [{ field: 'email', code: 'required', message: 'This field is required.' }]),
        ...(body.password ? [] : [{ field: 'password', code: 'required', message: 'This field is required.' }]),
      ]);
    }
    if (body.email !== DEMO_CREDENTIALS.email || body.password !== DEMO_CREDENTIALS.password) {
      return errorEnvelope(
        401,
        'invalid_credentials',
        `Incorrect email or password. Demo mode accepts ${DEMO_CREDENTIALS.email} / ${DEMO_CREDENTIALS.password}.`,
      );
    }

    signedIn.set(true);
    return HttpResponse.json({
      access: `demo-access-${Date.now()}`,
      refresh: `demo-refresh-${Date.now()}`,
      user: DEMO_USER,
    });
  }),

  // SimpleJWT with rotation: a fresh refresh token comes back with the access.
  http.post(`${AUTH}/token/refresh/`, async () => {
    await delay(LATENCY);
    if (!signedIn.get()) {
      return errorEnvelope(401, 'token_not_valid', 'Token is invalid or expired.');
    }
    return HttpResponse.json({
      access: `demo-access-${Date.now()}`,
      refresh: `demo-refresh-${Date.now()}`,
    });
  }),

  // Blacklists the refresh token; body is empty, status 205.
  http.post(`${AUTH}/logout/`, async () => {
    await delay(LATENCY);
    signedIn.set(false);
    return new HttpResponse(null, { status: 205 });
  }),

  // `me` wraps the user; `profile` serves it bare — exactly like the backend.
  http.get(`${AUTH}/me/`, async ({ request }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    return HttpResponse.json({ user: DEMO_USER });
  }),

  http.get(`${AUTH}/profile/`, async ({ request }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    return HttpResponse.json(DEMO_USER);
  }),

  http.patch(`${AUTH}/profile/`, async ({ request }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const patch = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...DEMO_USER, ...patch });
  }),
];
