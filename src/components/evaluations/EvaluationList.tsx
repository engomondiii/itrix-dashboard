"use client";

import { ClipboardCheckIcon } from "lucide-react";

import { EvaluationCard } from "@/components/evaluations/EvaluationCard";
import { TriangleAlertIcon } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { useEvaluations } from "@/hooks/useDeals";

export function EvaluationList() {
  const { data, isLoading, isError } = useEvaluations();
  const rows = data?.results ?? [];

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
        icon={TriangleAlertIcon}
        title="Couldn’t load the evaluations"
        description="The request failed. Refresh the page, or try again in a moment."
      />
    );
  }
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={ClipboardCheckIcon}
        title="No paid evaluations yet"
        description="Evaluations appear here once a lead reaches the evaluation stage."
      />
    );
  }
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((e) => (
        <EvaluationCard key={e.id} evaluation={e} />
      ))}
    </div>
  );
}
