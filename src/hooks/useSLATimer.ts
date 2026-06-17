"use client";

import { useEffect, useState } from "react";

import { dashboardConfig } from "@/config/dashboard.config";

/** Returns a `now` timestamp that ticks on an interval, for live SLA countdowns. */
export function useSLATimer(): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), dashboardConfig.slaTickMs);
    return () => clearInterval(id);
  }, []);

  return now;
}
