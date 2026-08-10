'use client';

/**
 * Notification bell for the app-shell header.
 *
 * Built on the dropdown-menu primitive rather than a popover dependency —
 * a notification list *is* a menu: opened from a trigger, dismissed on
 * outside click and Escape, keyboard-navigable items. Reusing it also means
 * the focus-return contract is already right.
 *
 * The badge shows the unread count from its own cheap polling query; the
 * list query runs only while the menu is open (`enabled: open`), so closed
 * bells cost one count request every 30s and nothing more.
 *
 * Clicking an unread item marks it read; items with an `href` also navigate.
 * "Mark all read" stays visible while anything is unread — bulk-clearing is
 * the single most used action on any notification surface.
 */

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Bell } from 'lucide-react';

import { formatRelative } from '@/lib/entity/format';
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
  useUnreadCount,
  type NotificationRecord,
} from '@/lib/notifications';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const unread = useUnreadCount();
  const list = useNotifications(open);
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const unreadCount = unread.data?.unread ?? 0;
  const notifications = list.data?.results ?? [];

  function handleSelect(notification: NotificationRecord) {
    if (!notification.read) markRead.mutate(notification.id);
    // Site-relative paths only — same rule as the login page's ?next=
    // redirect. An href from the server is data, and data must not be able
    // to navigate the user off-site (`//evil.com` is protocol-relative).
    if (notification.href?.startsWith('/') && !notification.href.startsWith('//')) {
      router.push(notification.href);
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={
            unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'
          }
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-foreground/80 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          {unreadCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 animate-zoom-in items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={6} className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2.5">
          <p className="text-sm font-semibold">Notifications</p>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="h-6 px-2 text-xs font-normal text-muted-foreground hover:text-foreground"
            >
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className="my-0" />

        {list.isLoading && (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">Loading…</p>
        )}

        {!list.isLoading && notifications.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            Nothing here — you&apos;re all caught up.
          </p>
        )}

        {notifications.length > 0 && (
          <ul className="max-h-80 overflow-y-auto py-1">
            {notifications.map((notification) => (
              <li key={notification.id}>
                <DropdownMenuItem
                  onSelect={() => handleSelect(notification)}
                  className="flex-col items-start gap-0.5 px-3 py-2"
                >
                  <span className="flex w-full items-baseline gap-2">
                    {!notification.read && (
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 shrink-0 translate-y-[-1px] rounded-full bg-primary"
                      />
                    )}
                    <span
                      className={`flex-1 truncate text-sm ${
                        notification.read ? 'text-muted-foreground' : 'font-medium'
                      }`}
                    >
                      {notification.title}
                    </span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {formatRelative(notification.created_at)}
                    </span>
                  </span>
                  <span className="line-clamp-2 w-full text-xs text-muted-foreground">
                    {notification.body}
                  </span>
                </DropdownMenuItem>
              </li>
            ))}
          </ul>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
