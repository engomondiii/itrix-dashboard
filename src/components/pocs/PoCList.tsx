"use client";

import { useState } from "react";
import { FlaskConicalIcon, TriangleAlertIcon } from "lucide-react";

import { PoCCard } from "@/components/pocs/PoCCard";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { Spinner } from "@/components/ui/spinner";
import { useListControls, type SortValue } from "@/hooks/useListControls";
import { usePoCs } from "@/hooks/useDeals";
import {
  POC_STATUSES,
  POC_STATUS_LABELS,
  type PoC,
  type PoCStatus,
} from "@/types/poc";

type SortKey = "updated";

const SORT_ACCESSORS: Record<SortKey, (p: PoC) => SortValue> = {
  updated: (p) => p.updatedAt,
};

export function PoCList() {
  const { data, isLoading, isError } = usePoCs();
  const rows = data?.results;

  const [status, setStatus] = useState<PoCStatus | null>(null);

  const { search, pageItems, total, unfilteredTotal, pagination } = useListControls<
    PoC,
    SortKey
  >({
    items: rows,
    searchText: (p) => `${p.leadName} ${p.company ?? ""} ${p.scope ?? ""}`,
    sortAccessors: SORT_ACCESSORS,
    initialSort: { key: "updated", dir: "desc" },
    filter: status ? (p) => p.status === status : undefined,
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
        title="Couldn’t load the PoCs"
        description="The request failed. Refresh the page, or try again in a moment."
      />
    );
  }
  if (!rows || rows.length === 0) {
    return (
      <EmptyState
        icon={FlaskConicalIcon}
        title="No PoCs in flight"
        description="PoCs appear here once a lead reaches the PoC stage."
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
          {POC_STATUSES.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={status === s ? "default" : "outline"}
              onClick={() => setStatus(s)}
            >
              {POC_STATUS_LABELS[s]}
            </Button>
          ))}
        </div>
      </div>

      {total === 0 ? (
        <EmptyState
          title="No matches"
          description={`No PoC matches this search or filter (${unfilteredTotal} total).`}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((p) => (
              <PoCCard key={p.id} poc={p} />
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
