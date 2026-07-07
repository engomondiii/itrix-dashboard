"use client";

import { ShieldCheckIcon } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { useApprovalQueue } from "@/hooks/useApprovals";

import { DraftCard } from "./DraftCard";

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
      <EmptyState
        icon={ShieldCheckIcon}
        title="Queue clear"
        description="No agent or team drafts are waiting for approval."
      />
    );
  }

  return (
    <div className="space-y-3">
      {data.map((r) => (
        <DraftCard key={r.id} request={r} />
      ))}
    </div>
  );
}
