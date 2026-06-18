"use client";

import { useRouter } from "next/navigation";
import { BellIcon, CheckCheckIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusDot } from "@/components/ui/status-dot";
import { formatTimeAgo } from "@/lib/formatting";
import {
  useNotificationActions,
  useNotifications,
} from "@/hooks/useNotifications";

export function NotificationBell() {
  const { data } = useNotifications();
  const { markRead, markAllRead } = useNotificationActions();
  const router = useRouter();
  const items = data?.results ?? [];
  const unread = data?.unread ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Notifications"
        className="relative inline-flex size-7 items-center justify-center rounded-md outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
      >
        <BellIcon className="size-4 text-ink-500" />
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 flex size-3.5 items-center justify-center rounded-full bg-error text-[9px] font-semibold text-white tabular-nums">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-1.5 py-1">
          <span className="text-xs font-medium text-muted-foreground">
            Notifications
          </span>
          {unread > 0 && (
            <button
              type="button"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-sapphire-600 transition-colors hover:text-sapphire-700 disabled:opacity-50"
            >
              <CheckCheckIcon className="size-3" />
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <div className="px-2 py-4 text-center text-caption text-ink-400">
            Nothing new.
          </div>
        ) : (
          items.map((n) => (
            <DropdownMenuItem
              key={n.id}
              className="flex-col items-start gap-0.5"
              onClick={() => {
                if (!n.read) markRead.mutate(n.id);
                if (n.href) router.push(n.href);
              }}
            >
              <div className="flex w-full items-center gap-2">
                {!n.read && <StatusDot intent="info" />}
                <span
                  className={
                    n.read
                      ? "truncate text-ink-600"
                      : "truncate font-medium text-ink-800"
                  }
                >
                  {n.title}
                </span>
              </div>
              <span className="text-caption text-ink-400">
                {formatTimeAgo(n.createdAt)}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
