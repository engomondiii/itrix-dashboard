"use client";

import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { QueryState } from "@/components/ui/query-state";
import { SearchInput } from "@/components/ui/search-input";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCustomers } from "@/hooks/useCustomers";
import { useListControls, type SortValue } from "@/hooks/useListControls";
import { ROUTES } from "@/constants/routes";
import { formatDate } from "@/lib/formatting";
import {
  HEALTH_CLASSES,
  HEALTH_CLASS_LABEL,
  HEALTH_CLASS_URGENCY,
  type CustomerListItem,
  type HealthClass,
} from "@/types/customer";

import { AccountOriginBadge } from "./AccountOriginBadge";
import { CustomerHealthBadge } from "./CustomerHealthBadge";
import { VerificationBadge } from "./VerificationBadge";

type SortKey = "company" | "health" | "adoption" | "nextReview" | "owner";

const urgency = (c: CustomerListItem) =>
  HEALTH_CLASS_URGENCY[c.healthClass] * 2 + (c.slaBreaching ? 1 : 0);

const SORT_ACCESSORS: Record<SortKey, (c: CustomerListItem) => SortValue> = {
  company: (c) => c.company,
  health: urgency,
  adoption: (c) => c.adoptionPercent,
  nextReview: (c) => c.nextReviewDate ?? null,
  owner: (c) => c.owner ?? null,
};

/**
 * Every paying customer, worst health first.
 *
 * THE POPULATION STARTS AT FIRST PAYMENT. A customer appears here the moment
 * first payment is recorded (journey state 7) — not at license-out. That is the
 * acceptance criterion for Phase 2, and it is the difference between a paid
 * Assessment customer having a named owner from day one and discovering they
 * have no support route when something breaks.
 *
 * WORST-FIRST IS RE-ASSERTED HERE (critical → at_risk → unknown → stable,
 * Surface 2 v6.0 §4.3) even though the backend already sorts, because a board
 * whose ordering silently depends on the wire order regresses the moment a
 * backend forgets — and the whole point of the order is that the account most
 * likely to be lost is the first one an operator sees. Column sorts are an
 * explicit operator override on top of that default; clearing back to the
 * default is just sorting by Health descending.
 */
export function CustomerHealthBoard() {
  const query = useCustomers();
  const worstFirst = query.data
    ? [...query.data].sort((a, b) => urgency(b) - urgency(a))
    : undefined;

  const [health, setHealth] = useState<HealthClass | null>(null);

  const { search, sort, toggleSort, pageItems, total, unfilteredTotal, pagination } =
    useListControls<CustomerListItem, SortKey>({
      items: worstFirst,
      searchText: (c) => `${c.company} ${c.owner ?? ""} ${c.reasons.join(" ")}`,
      sortAccessors: SORT_ACCESSORS,
      filter: health ? (c) => c.healthClass === health : undefined,
      filterKey: health ?? "all",
    });

  return (
    <div className="space-y-4">
      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        hasData={Boolean(worstFirst)}
        label="the customer health board"
        error={query.error}
      />

      {worstFirst && worstFirst.length === 0 && (
        <EmptyState
          title="No customers yet"
          description="A customer appears here as soon as a first payment is recorded — not at license-out."
        />
      )}

      {worstFirst && worstFirst.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput
              value={search.value}
              onChange={(e) => search.setValue(e.target.value)}
              placeholder="Search company, owner or reason…"
              wrapperClassName="w-full sm:w-72"
            />
            <div className="flex flex-wrap gap-1.5">
              <Button
                size="sm"
                variant={health === null ? "default" : "outline"}
                onClick={() => setHealth(null)}
              >
                All
              </Button>
              {HEALTH_CLASSES.map((h) => (
                <Button
                  key={h}
                  size="sm"
                  variant={health === h ? "default" : "outline"}
                  onClick={() => setHealth(h)}
                >
                  {HEALTH_CLASS_LABEL[h]}
                </Button>
              ))}
            </div>
          </div>

          {total === 0 && (
            <EmptyState
              title="No matches"
              description={`No customer matches this search or filter (${unfilteredTotal} total).`}
            />
          )}

          {total > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableTableHead sortKey="company" sort={sort} onToggle={toggleSort}>
                      Customer
                    </SortableTableHead>
                    <SortableTableHead sortKey="health" sort={sort} onToggle={toggleSort}>
                      Health
                    </SortableTableHead>
                    <TableHead>Outcomes</TableHead>
                    <TableHead>Support</TableHead>
                    <SortableTableHead sortKey="adoption" sort={sort} onToggle={toggleSort}>
                      Adoption
                    </SortableTableHead>
                    <SortableTableHead sortKey="nextReview" sort={sort} onToggle={toggleSort}>
                      Next review
                    </SortableTableHead>
                    <SortableTableHead sortKey="owner" sort={sort} onToggle={toggleSort}>
                      Owner
                    </SortableTableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((c) => (
                    <TableRow key={c.clientId}>
                      <TableCell>
                        <Link
                          href={ROUTES.customer(c.clientId)}
                          className="font-medium text-ink-primary hover:underline"
                        >
                          {c.company}
                        </Link>
                        {(c.journeyNumber != null || c.stateLabel) && (
                          <div className="text-micro text-ink-secondary">
                            {[c.journeyNumber, c.stateLabel].filter((v) => v != null).join(" · ")}
                          </div>
                        )}
                        {(c.accountOrigin !== undefined || c.emailVerified !== undefined) && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            <AccountOriginBadge origin={c.accountOrigin} />
                            <VerificationBadge
                              verified={c.emailVerified}
                              verifiedAt={c.emailVerifiedAt}
                            />
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <CustomerHealthBadge healthClass={c.healthClass} />
                        {/* The reasons are the valuable part — a class an operator
                            cannot explain is a number they will learn to ignore. */}
                        {c.reasons.length > 0 && (
                          <ul className="mt-1 space-y-0.5">
                            {c.reasons.map((reason) => (
                              <li key={reason} className="text-micro text-ink-secondary">
                                {reason}
                              </li>
                            ))}
                          </ul>
                        )}
                      </TableCell>

                      <TableCell>
                        {c.outcomes ? (
                          <span className="flex flex-wrap gap-1">
                            {c.outcomes.offPlan > 0 && (
                              <Badge variant="error">{c.outcomes.offPlan} off plan</Badge>
                            )}
                            {c.outcomes.atRisk > 0 && (
                              <Badge variant="warning">{c.outcomes.atRisk} at risk</Badge>
                            )}
                            {c.outcomes.achieved > 0 && (
                              <Badge variant="success">{c.outcomes.achieved} achieved</Badge>
                            )}
                            {c.outcomes.offPlan === 0 &&
                              c.outcomes.atRisk === 0 &&
                              c.outcomes.achieved === 0 && (
                                <span className="text-caption text-ink-secondary">
                                  {c.outcomes.onPlan} on plan
                                </span>
                              )}
                          </span>
                        ) : (c.outcomesOffPlan ?? 0) > 0 ? (
                          /* The thin v7.1 row carries only the off-plan count. */
                          <Badge variant="error">{c.outcomesOffPlan} off plan</Badge>
                        ) : (
                          <span className="text-micro text-ink-muted">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        {c.openSupportCount != null && c.openSupportCount > 0 ? (
                          <Badge variant={c.slaBreaching ? "error" : "warning"}>
                            {c.openSupportCount} open
                            {c.slaBreaching ? " · SLA breached" : ""}
                          </Badge>
                        ) : c.blockingSupport ? (
                          /* The thin row says only whether blocking support exists. */
                          <Badge variant="error">blocking open</Badge>
                        ) : (
                          <span className="text-micro text-ink-muted">—</span>
                        )}
                      </TableCell>

                      <TableCell className="tabular-nums text-sec text-ink-secondary">
                        {c.adoptionPercent != null ? `${c.adoptionPercent}%` : "—"}
                      </TableCell>

                      <TableCell className="text-sec text-ink-secondary">
                        {c.nextReviewDate ? formatDate(c.nextReviewDate) : "—"}
                      </TableCell>

                      <TableCell className="text-sec text-ink-secondary">
                        {c.owner ?? <span className="italic text-ink-secondary">Unassigned</span>}
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
        </>
      )}
    </div>
  );
}
