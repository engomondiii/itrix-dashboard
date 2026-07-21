"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { QueryState } from "@/components/ui/query-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAllOutcomes } from "@/hooks/useCustomers";
import { ROUTES } from "@/constants/routes";
import { formatDate } from "@/lib/formatting";
import { OUTCOME_STATUSES, OUTCOME_STATUS_INTENT } from "@/types/customer";

/**
 * Every agreed outcome across the book — "are we delivering what we promised?"
 *
 * Sorted so that anything off plan leads. The aggregate matters because a
 * single customer's off-plan outcome looks like bad luck; the same outcome off
 * plan across four customers is a product problem.
 */
export function OutcomeBookView() {
  const query = useAllOutcomes();
  const outcomes = query.data;

  const counts = OUTCOME_STATUSES.map((status) => ({
    status,
    count: (outcomes ?? []).filter((o) => o.status === status).length,
  }));

  const ordered = [...(outcomes ?? [])].sort((a, b) => {
    const rank = (s: string) => (s === "Off plan" ? 0 : s === "At risk" ? 1 : s === "On plan" ? 2 : 3);
    return rank(a.status) - rank(b.status);
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
        <div className="flex flex-wrap gap-2">
          {counts
            .filter((c) => c.count > 0)
            .map((c) => (
              <Badge key={c.status} variant={OUTCOME_STATUS_INTENT[c.status]}>
                {c.count} {c.status.toLowerCase()}
              </Badge>
            ))}
        </div>
      )}

      {outcomes && outcomes.length === 0 && (
        <EmptyState
          title="No outcomes agreed yet"
          description="Outcomes appear here once a success plan is agreed with a paying customer."
        />
      )}

      {ordered.length > 0 && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Outcome</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Target</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordered.map((o) => (
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
        </div>
      )}
    </div>
  );
}
