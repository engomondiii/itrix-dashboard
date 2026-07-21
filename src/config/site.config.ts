/** Site-wide metadata and environment flags. */

/**
 * MOCK MODE IS A SECURITY BOUNDARY, NOT A CONVENIENCE FLAG.
 *
 * Mock mode grants an unauthenticated ADMIN session: `api/auth/login` accepts
 * any credentials and every proxy route serves fixtures instead of calling
 * Django with a real team-JWT. Surface 2 v5.0 §10 requires it to be
 * fail-closed twice over, because the previous default (`!== "false"`) meant a
 * deploy that simply forgot to set the variable shipped with auth disabled.
 *
 *   1. OPT-IN BY EXACT VALUE. Only the literal string "true" enables it.
 *      Anything else — unset, empty, "1", "TRUE", a typo — leaves it off.
 *   2. FORCE-DISABLED IN PRODUCTION BUILDS. Even an explicit "true" cannot
 *      re-enable it once NODE_ENV is "production".
 *
 * BUILD-TIME, NOT RUNTIME. `NEXT_PUBLIC_*` values are inlined by the compiler,
 * so this resolves during `next build` and cannot be flipped afterwards by the
 * runtime environment. Verify the flag at build time, not after it.
 */
const mocksRequested = process.env.NEXT_PUBLIC_USE_MOCKS === "true";
const isProductionBuild = process.env.NODE_ENV === "production";

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? "iTrix Operations",
  shortName: "iTrix Ops",
  description:
    "Internal operations dashboard for the itriX AI Sales Engine (Surface 2).",

  /**
   * When true, the app serves data from the route-handler mock layer instead of
   * Django. Opt-in only, and never true in a production build — see above.
   */
  useMocks: mocksRequested && !isProductionBuild,

  /**
   * Django backend base URL (used by Next proxy route handlers, server-side).
   * NEXT_PUBLIC_API_URL is the standard name in Backend v6.0 / Surface 2 v5.0;
   * DJANGO_API_URL kept as a fallback.
   */
  djangoApiUrl:
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.DJANGO_API_URL ??
    "http://localhost:8000/api/v1",

  /** WebSocket base for the console + thread realtime transport (Surface 2 v5.0). */
  wsUrl: process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000/ws",
} as const;

export type SiteConfig = typeof siteConfig;
