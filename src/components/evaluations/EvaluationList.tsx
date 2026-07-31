"use client";

import { useState } from "react";
import { ClipboardCheckIcon, TriangleAlertIcon } from "lucide-react";

import { EvaluationCard } from "@/components/evaluations/EvaluationCard";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { Spinner } from "@/components/ui/spinner";
import { useEvaluations } from "@/hooks/useDeals";
import { useListControls, type SortValue } from "@/hooks/useListControls";
import {
  EVALUATION_STATUSES,
  EVALUATION_STATUS_LABELS,
  type Evaluation,
  type EvaluationStatus,
} from "@/types/evaluation";

type SortKey = "updated";

const SORT_ACCESSORS: Record<SortKey, (e: Evaluation) => SortValue> = {
  updated: (e) => e.updatedAt,
};

export function EvaluationList() {
  const { data, isLoading, isError } = useEvaluations();
  const rows = data?.results;

  const [status, setStatus] = useState<EvaluationStatus | null>(null);

  const { search, pageItems, total, unfilteredTotal, pagination } = useListControls<
    Evaluation,
    SortKey
  >({
    items: rows,
    searchText: (e) => `${e.leadName} ${e.company ?? ""} ${e.scope ?? ""}`,
    sortAccessors: SORT_ACCESSORS,
    initialSort: { key: "updated", dir: "desc" },
    filter: status ? (e) => e.status === status : undefined,
    filterKey: status ?? "all",
  });

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
  if (!rows || rows.length === 0) {
    return (
      <EmptyState
        icon={ClipboardCheckIcon}
        title="No paid evaluations yet"
        description="Evaluations appear here once a lead reaches the evaluation stage."
      />
    );
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={search.value}
          onChange={(e) => search.setValue(e.target.value)}
          placeholder="Search lead, company or scope…"
          wrapperClassName="w-full sm:w-72"
        />
        <div className="flex flex-wrap gap-1.5">
          <Button
            size="sm"
            variant={status === null ? "default" : "outline"}
            onClick={() => setStatus(null)}
          >
            All
          </Button>
          {EVALUATION_STATUSES.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={status === s ? "default" : "outline"}
              onClick={() => setStatus(s)}
            >
              {EVALUATION_STATUS_LABELS[s]}
            </Button>
          ))}
        </div>
      </div>

      {total === 0 ? (
        <EmptyState
          title="No matches"
          description={`No evaluation matches this search or filter (${unfilteredTotal} total).`}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((e) => (
              <EvaluationCard key={e.id} evaluation={e} />
            ))}
          </div>
          <Pagination
            page={pagination.page}
            pageCount={pagination.pageCount}
            onPageChange={pagination.setPage}
            total={total}
            pageSize={pagination.pageSize}
          />
        </>
      )}
    </div>
  );
}
