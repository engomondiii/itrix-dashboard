"use client";

import { ClockIcon } from "lucide-react";

import { useSLATimer } from "@/hooks/useSLATimer";
import { remainingMs } from "@/lib/sla/slaCalculator";
import { formatSLATime } from "@/lib/formatting";
import { cn } from "@/lib/utils";

const SOON_MS = 4 * 60 * 60 * 1000;

/** Live SLA countdown; colors by remaining time. Tooltip shows the exact deadline. */
export function FollowUpSLATimer({ dueAt }: { dueAt: string }) {
  const now = useSLATimer();
  const ms = remainingMs(dueAt, now);
  const overdue = ms <= 0;
  const soon = !overdue && ms < SOON_MS;
  const exact = new Date(dueAt);
  const title = Number.isNaN(exact.getTime())
    ? undefined
    : `Due ${exact.toLocaleString()}`;

  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1 text-caption font-medium tabular-nums",
        overdue ? "text-error-text" : soon ? "text-warning-text" : "text-ink-500",
      )}
    >
      <ClockIcon className="size-3.5" />
      {formatSLATime(ms)}
    </span>
  );
}
