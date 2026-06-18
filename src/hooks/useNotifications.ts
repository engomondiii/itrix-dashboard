"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationFeed,
} from "@/lib/api/settingsApi";
import { dashboardConfig } from "@/config/dashboard.config";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: listNotifications,
    refetchInterval: dashboardConfig.polling.notifications,
  });
}

/** Mark-read mutations; write the fresh feed straight into the cache. */
export function useNotificationActions() {
  const qc = useQueryClient();
  const onSuccess = (data: NotificationFeed) =>
    qc.setQueryData(["notifications"], data);

  return {
    markRead: useMutation({
      mutationFn: (id: string) => markNotificationRead(id),
      onSuccess,
    }),
    markAllRead: useMutation({
      mutationFn: () => markAllNotificationsRead(),
      onSuccess,
    }),
  };
}
