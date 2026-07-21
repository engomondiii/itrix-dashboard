"use client";

import { AlertTriangleIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useJourneyMigrationReport } from "@/hooks/useJourney";
import { JOURNEY_STATE_LABEL } from "@/constants/journeyStates";
import { StateBadge } from "./StateBadge";

/**
 * The ENGAGED-split migration, as a DRY RUN.
 *
 * `ENGAGED` carried a paid Assessment, a paid PoC and an integration heading
 * for license-out all at once. Splitting it into states 7/8/9 means deciding,
 * per lead, which rung it was actually on — and that decision is inferred from
 * Evaluation / PoC / license records rather than stated anywhere.
 *
 * NOTHING HAS BEEN WRITTEN when this renders. The backend command
 * (`journey_migration_report`) produces the proposal, a human reviews it, and
 * only then is `0003_migrate_engaged_split` applied — reversibly. This panel is
 * that review step, which is why the rows nobody can justify are pulled to the
 * top rather than buried in a count.
 *
 * Surface 2 v5.0 §00.1 item 5 · Backend v6.0 §09 Phase 1
 */
export function MigrationReportPanel() {
  const query = useJourneyMigrationReport();
  const report = query.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>ENGAGED split — migration dry run</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <QueryState
          isLoading={query.isLoading}
          isError={query.isError}
          hasData={Boolean(report)}
          label="the migration report"
        />

        {report && report.totalLegacy === 0 && (
          <EmptyState
            title="Nothing to migrate"
            description="No leads are still on a retired state value."
          />
        )}

        {report && report.totalLegacy > 0 && (
          <>
              <p className="text-caption text-ink-secondary">
                Proposal only — no data has been changed. Review, then apply
                <code className="mx-1 rounded bg-soft px-1 py-0.5 font-mono text-micro">
                  0003_migrate_engaged_split
                </code>
                . The migration is reversible.
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="neutral">{report.totalLegacy} on a retired value</Badge>
                {Object.entries(report.proposed).map(([state, count]) => (
                  <Badge key={state} variant="info">
                    {count} → {JOURNEY_STATE_LABEL[state as keyof typeof JOURNEY_STATE_LABEL]}
                  </Badge>
                ))}
              </div>

              {report.needsReviewCount > 0 && (
                <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning-soft p-3">
                  <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-warning-text" />
                  <p className="text-sec text-warning-text">
                    <strong className="font-semibold">
                      {report.needsReviewCount}{" "}
                      {report.needsReviewCount === 1 ? "row has" : "rows have"} no supporting
                      record.
                    </strong>{" "}
                    These fell back to the earliest rung in the range. Confirm each one
                    before applying — under-stating progress is recoverable, over-stating
                    it shows a lead as having cleared a gate it has not.
                  </p>
                </div>
              )}

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead</TableHead>
                      <TableHead>Stored</TableHead>
                      <TableHead>Proposed</TableHead>
                      <TableHead>Evidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Unjustified rows first — they are the reason to read this. */}
                    {[...report.rows]
                      .sort((a, b) => Number(b.needsReview) - Number(a.needsReview))
                      .map((row) => (
                        <TableRow key={row.leadId}>
                          <TableCell className="font-medium text-ink-primary">
                            {row.label}
                          </TableCell>
                          <TableCell>
                            <code className="font-mono text-micro text-ink-secondary">
                              {row.legacyState}
                            </code>
                          </TableCell>
                          <TableCell>
                            <StateBadge state={row.proposedState} />
                          </TableCell>
                          <TableCell className="max-w-[36ch] text-caption text-ink-secondary">
                            {row.needsReview && (
                              <Badge variant="warning" className="mr-1.5">
                                Needs review
                              </Badge>
                            )}
                            {row.evidenceDetail}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </>
        )}
      </CardContent>
    </Card>
  );
}
