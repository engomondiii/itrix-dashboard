"use client";

import Link from "next/link";
import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { QueryState } from "@/components/ui/query-state";
import { SearchInput } from "@/components/ui/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSuccessReviews } from "@/hooks/useCustomers";
import { useListControls, type SortValue } from "@/hooks/useListControls";
import { ROUTES } from "@/constants/routes";
import { formatDate } from "@/lib/formatting";
import type { SuccessReview } from "@/types/customer";

type SortKey = "scheduled" | "company";

const SORT_OPTIONS: Record<string, { key: SortKey; dir: "asc" | "desc"; label: string }> = {
  soonest: { key: "scheduled", dir: "asc", label: "Soonest first" },
  latest: { key: "scheduled", dir: "desc", label: "Latest first" },
  company: { key: "company", dir: "asc", label: "Company A–Z" },
};

const SORT_ACCESSORS: Record<SortKey, (r: SuccessReview) => SortValue> = {
  scheduled: (r) => r.scheduledAt,
  company: (r) => r.company,
};

/**
 * Upcoming success reviews and the agenda assembled for each.
 *
 * THE AGENDA IS ORDERED WORST-FIRST — off plan, then at risk, then open
 * support, then adoption, and achievements last. A review that opens with good
 * news and buries the problem wastes the one meeting where the customer is
 * definitely listening, so the ordering is a property of the assembly
 * (`success_review.py`), not a presentation choice this component makes.
 */
export function SuccessReviewScheduler() {
  const query = useSuccessReviews();
  const reviews = query.data;

  const [sortOption, setSortOption] = useState("soonest");

  const { search, setSort, pageItems, total, unfilteredTotal, pagination } =
    useListControls<SuccessReview, SortKey>({
      items: reviews,
      searchText: (r) => `${r.company} ${r.owner} ${r.agenda.join(" ")}`,
      sortAccessors: SORT_ACCESSORS,
      initialSort: { key: "scheduled", dir: "asc" },
    });

  return (
    <div className="space-y-4">
      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        hasData={Boolean(reviews)}
        label="scheduled reviews"
        error={query.error}
      />

      {reviews && reviews.length === 0 && (
        <EmptyState
          title="No reviews scheduled"
          description="A success review is scheduled for every customer from the first payment onward."
        />
      )}

      {reviews && reviews.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput
              value={search.value}
              onChange={(e) => search.setValue(e.target.value)}
              placeholder="Search company, owner or agenda…"
              wrapperClassName="w-full sm:w-72"
            />
            <Select
              value={sortOption}
              onValueChange={(v) => {
                const next = SORT_OPTIONS[String(v)];
                if (!next) return;
                setSortOption(String(v));
                setSort({ key: next.key, dir: next.dir });
              }}
            >
              <SelectTrigger size="sm" className="ml-auto">
                <SelectValue>
                  {(v) => `Sort: ${SORT_OPTIONS[String(v)]?.label ?? ""}`}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SORT_OPTIONS).map(([value, opt]) => (
                  <SelectItem key={value} value={value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {total === 0 ? (
            <EmptyState
              title="No matches"
              description={`No review matches this search (${unfilteredTotal} scheduled).`}
            />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {pageItems.map((review) => (
                  <Card key={review.id}>
                    <CardHeader>
                      <CardTitle>{review.company}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sec text-ink-secondary">
                        {formatDate(review.scheduledAt)} · {review.owner}
                      </p>
                      <div className="space-y-1">
                        <div className="text-micro font-semibold uppercase tracking-[0.06em] text-ink-secondary">
                          Agenda
                        </div>
                        <ol className="space-y-0.5">
                          {review.agenda.map((item, i) => (
                            <li key={`${review.id}-${i}`} className="text-sec text-ink-primary">
                              {i + 1}. {item}
                            </li>
                          ))}
                        </ol>
                      </div>
                      <Link
                        href={ROUTES.customer(review.clientId)}
                        className="inline-block text-caption font-medium text-ink-primary hover:underline"
                      >
                        Open the customer →
                      </Link>
                    </CardContent>
                  </Card>
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
        </>
      )}
    </div>
  );
}
