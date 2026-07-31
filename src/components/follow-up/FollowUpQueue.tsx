"use client";

import { CheckCheckIcon } from "lucide-react";

import { FollowUpTaskCard } from "@/components/follow-up/FollowUpTaskCard";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { Spinner } from "@/components/ui/spinner";
import { useFollowUpQueue } from "@/hooks/useFollowUp";
import { useListControls } from "@/hooks/useListControls";
import type { FollowUpFilter } from "@/lib/api/followUpApi";
import type { FollowUpTask } from "@/types/followUp";

/**
 * The follow-up queue. Wire order is SLA order — most urgent first — so, like
 * the approval queue, there is deliberately no sort control: search and paging
 * narrow the view without letting an operator quietly bury the breach at the
 * top.
 */
export function FollowUpQueue({ filter }: { filter?: FollowUpFilter }) {
  const { data, isLoading } = useFollowUpQueue(filter);
  const tasks = data?.results;

  const { search, pageItems, total, unfilteredTotal, pagination } = useListControls<
    FollowUpTask,
    never
  >({
    items: tasks,
    searchText: (t) => `${t.leadName} ${t.company ?? ""} ${t.owner ?? ""} ${t.note ?? ""}`,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="size-5" />
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <EmptyState
        icon={CheckCheckIcon}
        title="All clear"
        description="No follow-ups in this view."
      />
    );
  }

  return (
    <div className="space-y-3">
      <SearchInput
        value={search.value}
        onChange={(e) => search.setValue(e.target.value)}
        placeholder="Search lead, company, owner or note…"
        wrapperClassName="w-full sm:w-72"
      />
      {total === 0 ? (
        <EmptyState
          title="No matches"
          description={`No follow-up matches this search (${unfilteredTotal} in this view).`}
        />
      ) : (
        <>
          <div className="space-y-2">
            {pageItems.map((task) => (
              <FollowUpTaskCard key={task.id} task={task} />
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
