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
} as const;

export type SiteConfig = typeof siteConfig;
