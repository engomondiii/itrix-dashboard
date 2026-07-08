"use client";

import Link from "next/link";
import { ShieldCheckIcon } from "lucide-react";

import { useApprovalQueue } from "@/hooks/useApprovals";
import { ROUTES } from "@/constants/routes";

/**
 * Topbar chip: how many agent/team drafts are waiting for approval. Hidden when
 * the queue is empty. Refreshes on the shared ["approvals"] cache (live-invalidated
 * once the realtime transport is wired).
 */
export function ApprovalsIndicator() {
  const { data } = useApprovalQueue();
  const count = data?.length ?? 0;
  if (count === 0) return null;

  return (
    <Link
      href={ROUTES.agentApprovals}
      aria-label={`${count} drafts awaiting approval`}
      className="inline-flex h-7 items-center gap-1.5 rounded-md bg-warning-soft px-2 text-caption font-medium text-warning-text transition-opacity hover:opacity-80"
    >
      <ShieldCheckIcon className="size-3.5" />
      <span className="tabular-nums">{count}</span>
      <span className="hidden sm:inline">pending</span>
    </Link>
  );
}
