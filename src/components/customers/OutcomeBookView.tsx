"use client";

import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { QueryState } from "@/components/ui/query-state";
import { SearchInput } from "@/components/ui/search-input";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAllOutcomes } from "@/hooks/useCustomers";
import { useListControls, type SortValue } from "@/hooks/useListControls";
import { ROUTES } from "@/constants/routes";
import { formatDate } from "@/lib/formatting";
import {
  OUTCOME_STATUSES,
  OUTCOME_STATUS_INTENT,
  type Outcome,
  type OutcomeStatus,
} from "@/types/customer";

type SortKey = "title" | "customer" | "status" | "target";

/** Off plan leads by default — the promise most at risk is read first. */
const STATUS_RANK: Record<OutcomeStatus, number> = {
  "Off plan": 0,
  "At risk": 1,
  "On plan": 2,
  Achieved: 3,
};

const SORT_ACCESSORS: Record<SortKey, (o: Outcome) => SortValue> = {
  title: (o) => o.title,
  customer: (o) => o.clientId,
  status: (o) => STATUS_RANK[o.status],
  target: (o) => o.targetDate,
};

/**
 * Every agreed outcome across the book — "are we delivering what we promised?"
 *
 * Sorted so that anything off plan leads. The aggregate matters because a
 * single customer's off-plan outcome looks like bad luck; the same outcome off
 * plan across four customers is a product problem. The status count badges
 * double as filters, so "show me the four off-plan ones" is one click.
 */
export function OutcomeBookView() {
  const query = useAllOutcomes();
  const outcomes = query.data;

  const [status, setStatus] = useState<OutcomeStatus | null>(null);

  const counts = OUTCOME_STATUSES.map((s) => ({
    status: s,
    count: (outcomes ?? []).filter((o) => o.status === s).length,
  }));

  const ordered = outcomes
    ? [...outcomes].sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status])
    : undefined;

  const { search, sort, toggleSort, pageItems, total, unfilteredTotal, pagination } =
    useListControls<Outcome, SortKey>({
      items: ordered,
      searchText: (o) => `${o.title} ${o.clientId} ${o.measure}`,
      sortAccessors: SORT_ACCESSORS,
      filter: status ? (o) => o.status === status : undefined,
      filterKey: status ?? "all",
    });

  return (
    <div className="space-y-4">
      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        hasData={Boolean(outcomes)}
        label="outcomes"
        error={query.error}
      />

      {outcomes && outcomes.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={search.value}
            onChange={(e) => search.setValue(e.target.value)}
            placeholder="Search outcome, measure or customer…"
            wrapperClassName="w-full sm:w-72"
          />
          <div className="flex flex-wrap gap-1.5">
            {counts
              .filter((c) => c.count > 0)
              .map((c) => (
                <button
                  key={c.status}
                  type="button"
                  onClick={() => setStatus(status === c.status ? null : c.status)}
                  aria-pressed={status === c.status}
                  className={
                    status === c.status
                      ? "rounded-full ring-2 ring-ring"
                      : "rounded-full opacity-90 hover:opacity-100"
                  }
                >
                  <Badge variant={OUTCOME_STATUS_INTENT[c.status]}>
                    {c.count} {c.status.toLowerCase()}
                  </Badge>
                </button>
              ))}
          </div>
        </div>
      )}

      {outcomes && outcomes.length === 0 && (
        <EmptyState
          title="No outcomes agreed yet"
          description="Outcomes appear here once a success plan is agreed with a paying customer."
        />
      )}

      {outcomes && outcomes.length > 0 && total === 0 && (
        <EmptyState
          title="No matches"
          description={`No outcome matches this search or filter (${unfilteredTotal} total).`}
        />
      )}

      {total > 0 && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHead sortKey="title" sort={sort} onToggle={toggleSort}>
                  Outcome
                </SortableTableHead>
                <SortableTableHead sortKey="customer" sort={sort} onToggle={toggleSort}>
                  Customer
                </SortableTableHead>
                <SortableTableHead sortKey="status" sort={sort} onToggle={toggleSort}>
                  Status
                </SortableTableHead>
                <SortableTableHead sortKey="target" sort={sort} onToggle={toggleSort}>
                  Target
                </SortableTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium text-ink-primary">{o.title}</TableCell>
                  <TableCell className="text-sec text-ink-secondary">
                    <Link href={ROUTES.customer(o.clientId)} className="hover:underline">
                      {o.clientId}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={OUTCOME_STATUS_INTENT[o.status]}>{o.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sec text-ink-secondary">
                    {o.targetDate ? formatDate(o.targetDate) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            page={pagination.page}
            pageCount={pagination.pageCount}
            onPageChange={pagination.setPage}
            total={total}
            pageSize={pagination.pageSize}
            className="mt-3"
          />
        </div>
      )}
    </div>
  );
}
