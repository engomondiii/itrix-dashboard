/** Dashboard-wide behavioral constants. */
export const dashboardConfig = {
  /** Default page size for lead/evaluation/PoC tables. */
  pageSize: 25,

  /** Live-update polling intervals (ms). */
  polling: {
    overview: 60_000,
    followUp: 30_000,
    notifications: 45_000,
    /** Console thread + approval queue poll cadence (until realtime is on). */
    console: 15_000,
  },

  /** SLA countdown tick interval (ms) for live timers. */
  slaTickMs: 30_000,

  /** Layout (mirrors CSS vars in globals.css). */
  layout: {
    sidebarWidth: 240,
    sidebarWidthCollapsed: 64,
    topbarHeight: 56,
  },
} as const;

export type DashboardConfig = typeof dashboardConfig;
