"use client";

import { useDashboardSocket } from "@/hooks/useDashboardSocket";

/** Mounts the app-wide console socket (no-op until realtime is enabled). */
export function RealtimeBridge() {
  useDashboardSocket();
  return null;
}
