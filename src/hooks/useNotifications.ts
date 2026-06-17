"use client";

import { useQuery } from "@tanstack/react-query";

import { listNotifications } from "@/lib/api/settingsApi";
import { dashboardConfig } from "@/config/dashboard.config";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: listNotifications,
    refetchInterval: dashboardConfig.polling.notifications,
  });
}
