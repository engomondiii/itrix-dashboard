"use client";

import { useRouter } from "next/navigation";
import { BellIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusDot } from "@/components/ui/status-dot";
import { formatTimeAgo } from "@/lib/formatting";
import { useNotifications } from "@/hooks/useNotifications";

export function NotificationBell() {
  const { data } = useNotifications();
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
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <div className="px-2 py-4 text-center text-caption text-ink-400">Nothing new.</div>
        ) : (
          items.map((n) => (
            <DropdownMenuItem
              key={n.id}
              className="flex-col items-start gap-0.5"
              onClick={() => n.href && router.push(n.href)}
            >
              <div className="flex w-full items-center gap-2">
                {!n.read && <StatusDot intent="info" />}
                <span className="truncate font-medium text-ink-800">{n.title}</span>
              </div>
              <span className="text-caption text-ink-400">{formatTimeAgo(n.createdAt)}</span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
