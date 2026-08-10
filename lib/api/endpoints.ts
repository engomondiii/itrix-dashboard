/**
 * Every backend path in one place.
 *
 * Paths are RELATIVE. That is the important design choice here, and it is a
 * correction of a pattern that looked reasonable and caused real bugs.
 *
 * The tempting version builds absolute URLs:
 *
 *     export const Endpoints = {
 *       Login: `${getApiUrl()}/auth/login/`,     // don't
 *     };
 *
 * That evaluates `getApiUrl()` when the module is first imported — which, in
 * a Docker deployment, can be before `env-config.js` has populated
 * `window.__ENV__`. The host is frozen to the build-time fallback, forever,
 * for every endpoint defined this way. The failure is silent: the app works
 * in development and points at `localhost:8000` in production.
 *
 * A real project hit exactly this and worked around it inside the HTTP
 * client, with an interceptor that parsed every outgoing absolute URL and
 * stripped the origin back off if the path looked like one of its own:
 *
 *     if (config.url && /^https?:\/\//i.test(config.url)) {
 *       const parsed = new URL(config.url);
 *       if (parsed.pathname.startsWith('/api/')) {
 *         config.url = parsed.pathname + parsed.search;   // undo the join
 *       }
 *     }
 *
 * Building a URL and then taking it apart again on every request is the
 * symptom. Keeping paths relative and letting axios's `baseURL` — which the
 * client re-reads per request — supply the host removes the cause. Axios
 * ignores `baseURL` whenever the URL is absolute, so relative paths are also
 * what makes `baseURL` work at all.
 *
 * Corollary: if you need an absolute URL (an `<a href>`, a redirect target),
 * call `absoluteUrl()` at the point of use, not at module scope.
 */

import { getApiUrl } from '@/lib/env';

/** Resolve a relative endpoint against the runtime API host. Call at use time. */
export function absoluteUrl(path: string): string {
  const base = getApiUrl();
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

const V1 = '/api/v1';

export const Endpoints = {
  /**
   * The itriX TEAM auth plane (itrix-backend `apps/authentication/`).
   * There is no register / password-reset / verify-email here — staff
   * accounts are provisioned; those routes on the backend belong to the
   * public self-serve plane and must not be called from this app.
   */
  Auth: {
    Login: `${V1}/auth/login/`,
    Logout: `${V1}/auth/logout/`,
    // Not called through the authenticated client — see `client.ts`.
    TokenRefresh: `${V1}/auth/token/refresh/`,
    /** GET → `{user: SessionUser}` (note the wrapper). */
    Me: `${V1}/auth/me/`,
    /** GET/PATCH → bare SessionUser. */
    Profile: `${V1}/auth/profile/`,
  },

  Core: {
    Health: '/health/',
  },

  /**
   * In-app notifications (`lib/notifications/`). The backend has no separate
   * unread-count route — list returns `{results, count, unreadCount}` and the
   * bell polls it with `?unread=true` to keep the payload small.
   */
  Notifications: {
    List: `${V1}/notifications/`,
    MarkRead: (id: string | number) => `${V1}/notifications/${id}/read/`,
    MarkAllRead: `${V1}/notifications/read-all/`,
  },
} as const;

export default Endpoints;
