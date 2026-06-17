"use client";

import { CheckCheckIcon } from "lucide-react";

import { FollowUpTaskCard } from "@/components/follow-up/FollowUpTaskCard";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { useFollowUpQueue } from "@/hooks/useFollowUp";
import type { FollowUpFilter } from "@/lib/api/followUpApi";

export function FollowUpQueue({ filter }: { filter?: FollowUpFilter }) {
  const { data, isLoading } = useFollowUpQueue(filter);
  const tasks = data?.results ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="size-5" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={CheckCheckIcon}
        title="All clear"
        description="No follow-ups in this view."
      />
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <FollowUpTaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
