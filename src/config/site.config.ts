/** Site-wide metadata and environment flags. */

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? "iTrix Operations",
  shortName: "iTrix Ops",
  description:
    "Internal operations dashboard for the itriX AI Sales Engine (Surface 2).",

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
