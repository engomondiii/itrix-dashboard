"use client";

import { PipelineColumn } from "@/components/pipeline/PipelineColumn";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { usePipeline } from "@/hooks/usePipeline";
import { KanbanSquareIcon } from "lucide-react";

export function PipelineBoard() {
  const { data, isLoading, isError } = usePipeline();

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="size-5" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <EmptyState
        icon={KanbanSquareIcon}
        title="Could not load the pipeline"
        description="Try refreshing the page."
      />
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {data.stages.map((stage) => (
        <PipelineColumn key={stage.status} stage={stage} />
      ))}
    </div>
  );
}
