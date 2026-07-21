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
import { useCustomers } from "@/hooks/useCustomers";
import { ROUTES } from "@/constants/routes";
import { formatDate } from "@/lib/formatting";

import { CustomerHealthBadge } from "./CustomerHealthBadge";

/**
 * Every paying customer, worst health first.
 *
 * THE POPULATION STARTS AT FIRST PAYMENT. A customer appears here the moment
 * first payment is recorded (journey state 7) — not at license-out. That is the
 * acceptance criterion for Phase 2, and it is the difference between a paid
 * Assessment customer having a named owner from day one and discovering they
 * have no support route when something breaks.
 */
export function CustomerHealthBoard() {
  const query = useCustomers();
  const rows = query.data;

  return (
    <div className="space-y-4">
      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        hasData={Boolean(rows)}
        label="the customer health board"
        error={query.error}
      />

      {rows && rows.length === 0 && (
        <EmptyState
          title="No customers yet"
          description="A customer appears here as soon as a first payment is recorded — not at license-out."
        />
      )}

      {rows && rows.length > 0 && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Health</TableHead>
                <TableHead>Outcomes</TableHead>
                <TableHead>Support</TableHead>
                <TableHead>Adoption</TableHead>
                <TableHead>Next review</TableHead>
                <TableHead>Owner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.clientId}>
                  <TableCell>
                    <Link
                      href={ROUTES.customer(c.clientId)}
                      className="font-medium text-ink-primary hover:underline"
                    >
                      {c.company}
                    </Link>
                    <div className="text-micro text-ink-secondary">
                      {c.journeyNumber} · {c.stateLabel}
                    </div>
                  </TableCell>

                  <TableCell>
                    <CustomerHealthBadge healthClass={c.healthClass} />
                  </TableCell>

                  <TableCell>
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
                  </TableCell>

                  <TableCell>
                    {c.openSupportRequests === 0 ? (
                      <span className="text-micro text-ink-muted">—</span>
                    ) : (
                      <Badge variant={c.supportBreaching ? "error" : "warning"}>
                        {c.openSupportRequests} open
                        {c.supportBreaching ? " · SLA breached" : ""}
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="tabular-nums text-sec text-ink-secondary">
                    {c.adoptionPercent}%
                  </TableCell>

                  <TableCell className="text-sec text-ink-secondary">
                    {c.nextReviewAt ? formatDate(c.nextReviewAt) : "—"}
                  </TableCell>

                  <TableCell className="text-sec text-ink-secondary">
                    {c.owner ?? <span className="text-ink-muted">Unassigned</span>}
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
