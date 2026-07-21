"use client";

import { ShieldCheckIcon } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { BlockingApprovalBanner } from "@/components/governance/BlockingApprovalBanner";
import { useApprovalQueue } from "@/hooks/useApprovals";

import { DraftCard } from "./DraftCard";

/**
 * The approval queue.
 *
 * v5.0 changes its character rather than its contents: with streaming, an
 * approval may be blocking a visitor who is sitting in front of the
 * conversation right now. Those are pinned above the queue by
 * `BlockingApprovalBanner`, ordered by the VISITOR's wait time — the ordering
 * rule from §5.1 is visitor wait first, then claim level, then age, because a
 * two-minute-old approval with someone watching outranks an hour-old one with
 * nobody there.
 */
export function ApprovalQueue() {
  const { data, isLoading, isError } = useApprovalQueue();

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="size-5" />
      </div>
    );
  }
  if (isError) {
    return (
      <EmptyState
        title="Couldn’t load the queue"
        description="The approvals endpoint isn’t available yet."
      />
    );
  }
  if (!data || data.length === 0) {
    return (
      <div className="space-y-3">
        {/* A blocked visitor is still worth showing even when the drafting
            queue itself is clear — the two are separate backlogs. */}
        <BlockingApprovalBanner />
        <EmptyState
          icon={ShieldCheckIcon}
          title="Queue clear"
          description="No agent or team drafts are waiting for approval."
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <BlockingApprovalBanner />
      {data.map((r) => (
        <DraftCard key={r.id} request={r} />
      ))}
    </div>
  );
}
