/** Site-wide metadata and environment flags. */
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? "iTrix Operations",
  shortName: "iTrix Ops",
  description:
    "Internal operations dashboard for the itriX AI Sales Engine (Surface 2).",

  /** When true, the app serves data from the route-handler mock layer instead of Django. */
  useMocks: process.env.NEXT_PUBLIC_USE_MOCKS !== "false",

  /**
   * Django backend base URL (used by Next proxy route handlers, server-side).
   * NEXT_PUBLIC_API_URL is the standard name in Backend v3 / Surface 2 v2;
   * DJANGO_API_URL kept as a fallback.
   */
  djangoApiUrl:
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.DJANGO_API_URL ??
    "http://localhost:8000/api/v1",

  /** WebSocket base for realtime (Surface 2 v3.0). */
  wsUrl: process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000/ws",

  /**
   * Surface 2 v3.0 capability flags (all default OFF). With every flag off the
   * dashboard behaves exactly like the shipped v2 CRM; each flag reveals one new
   * operator capability area (and its nav).
   */
  flags: {
    /** Real-time console + agent oversight (approvals, runs, RunAgentMenu). */
    agentConsole: process.env.NEXT_PUBLIC_ENABLE_AGENT_CONSOLE === "true",
    /** Sales cockpit panel + pitch analytics. */
    cockpit: process.env.NEXT_PUBLIC_ENABLE_COCKPIT === "true",
    /** Live WebSockets everywhere (else poll-fallback). */
    realtime: process.env.NEXT_PUBLIC_ENABLE_REALTIME === "true",
    /** Claim-Card governance admin + audit. */
    governance: process.env.NEXT_PUBLIC_ENABLE_GOVERNANCE === "true",
  },
} as const;

export type SiteConfig = typeof siteConfig;
export type FeatureFlag = keyof typeof siteConfig.flags;

/** True when a feature flag is enabled (undefined flag = always visible). */
export function isFeatureEnabled(flag?: FeatureFlag): boolean {
  return flag == null || siteConfig.flags[flag];
}
