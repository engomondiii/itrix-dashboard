'use client';

/**
 * In-app notifications: type + react-query hooks.
 *
 * Deliberately polling, not websockets. A 30-second unread-count poll is one
 * cheap request and works through every proxy, container, and corporate
 * network without a Channels deployment behind it. When the backend grows a
 * websocket, swap the `refetchInterval` for an invalidation triggered by the
 * socket message — the components above this file do not change.
 *
 * The list and the count are separate queries on purpose: the bell polls the
 * count endlessly, but the list — with bodies — is fetched only when the
 * popover opens. Mutations invalidate the whole `['notifications']` prefix so
 * both stay consistent without knowing about each other.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { http } from '@/lib/api/client';
import { Endpoints } from '@/lib/api/endpoints';
import type { Paginated } from '@/lib/api/types';

export interface NotificationRecord {
  id: string;
  title: string;
  body: string;
  created_at: string;
  read: boolean;
  /** Optional in-app destination; rendering decides what a click does. */
  href?: string;
}

const KEY = {
  all: ['notifications'] as const,
  list: ['notifications', 'list'] as const,
  unread: ['notifications', 'unread'] as const,
};

export function useNotifications(enabled = true) {
  return useQuery({
    queryKey: KEY.list,
    queryFn: () => http.get<Paginated<NotificationRecord>>(Endpoints.Notifications.List),
    enabled,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: KEY.unread,
    queryFn: () => http.get<{ unread: number }>(Endpoints.Notifications.UnreadCount),
    refetchInterval: 30_000,
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      http.post<NotificationRecord>(Endpoints.Notifications.MarkRead(id), {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY.all }),
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => http.post<{ count: number }>(Endpoints.Notifications.MarkAllRead, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY.all }),
  });
}
