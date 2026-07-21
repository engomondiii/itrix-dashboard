"use client";

import Link from "next/link";
import { ClockAlertIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useBlockingApprovals } from "@/hooks/useStreamingGovernance";
import { ROUTES } from "@/constants/routes";
import { features } from "@/config/features.config";

function waitLabel(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  return mins >= 1 ? `${mins}m ${seconds % 60}s` : `${seconds}s`;
}

/**
 * Approvals with a visitor sitting in front of them.
 *
 * Streaming changed the character of the approval queue: an approval may now be
 * blocking someone who is watching a conversation that has stopped moving. The
 * banner pins those to the top and shows the VISITOR's wait — not the
 * approval's age, which is a different and less urgent number.
 *
 * Ordered by wait time, longest first, matching the queue's own ordering rule
 * (§5.1: visitor wait time, then claim level, then age).
 */
export function BlockingApprovalBanner() {
  const { data: blocking } = useBlockingApprovals();

  if (!features.streamingApproval) return null;
  if (!blocking || blocking.length === 0) return null;

  return (
    <div className="space-y-2 rounded-md border border-error/40 bg-error-soft p-3">
      <div className="flex items-center gap-2">
        <ClockAlertIcon className="size-4 shrink-0 text-error-text" aria-hidden="true" />
        <p className="text-sec font-semibold text-error-text">
          {blocking.length} approval{blocking.length === 1 ? " is" : "s are"} blocking a
          live visitor
        </p>
      </div>
      <ul className="space-y-1.5">
        {blocking.map((item) => (
          <li key={item.approvalId} className="flex flex-wrap items-center gap-2">
            <Badge variant="error" className="tabular-nums">
              waiting {waitLabel(item.waitingSeconds)}
            </Badge>
            <Badge variant="neutral">L{item.claimLevel}</Badge>
            <Link
              href={ROUTES.thread(item.threadId)}
              className="text-sec text-ink-primary hover:underline"
            >
              {item.threadTitle}
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-caption text-error-text">
        Approving, editing or rejecting emits straight back into the thread — the
        visitor sees the settled turn replace the under-review notice.
      </p>
    </div>
  );
}
