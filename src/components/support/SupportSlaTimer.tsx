"use client";

import { Badge } from "@/components/ui/badge";
import { formatSLATime } from "@/lib/formatting";
import { useSLATimer } from "@/hooks/useSLATimer";

/**
 * Time until (or since) a support request's first-response SLA.
 *
 * Reuses `useSLATimer` rather than duplicating the countdown — Surface 2 v5.0
 * §06 Phase 2 says explicitly to reuse it for support SLA rather than write a
 * second one. Two independent timers would eventually disagree about what
 * "overdue" means, and follow-up SLAs and support SLAs must raise the same
 * alerting path.
 *
 * A resolved request shows nothing: an SLA that has already been met is not a
 * countdown, and rendering "overdue" against closed work is noise.
 */
export function SupportSlaTimer({
  dueAt,
  resolved,
}: {
  dueAt: string;
  resolved: boolean;
}) {
  // `useSLATimer` returns a ticking `now`, so the countdown is derived here.
  // The hook is called unconditionally — bailing out before it on a resolved
  // request would change the hook order between renders.
  const now = useSLATimer();
  const remainingMs = Date.parse(dueAt) - now;

  if (resolved) return null;

  const overdue = remainingMs <= 0;
  const soon = !overdue && remainingMs < 30 * 60_000;

  return (
    <Badge
      variant={overdue ? "error" : soon ? "warning" : "neutral"}
      className="tabular-nums"
    >
      {formatSLATime(remainingMs)}
    </Badge>
  );
}
