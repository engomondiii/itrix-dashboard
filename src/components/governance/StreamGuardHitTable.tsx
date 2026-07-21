"use client";

import Link from "next/link";

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
import { useStreamingGovernance } from "@/hooks/useStreamingGovernance";
import { ROUTES } from "@/constants/routes";
import { formatDateTime } from "@/lib/formatting";
import { GUARD_PATTERNS, GUARD_PATTERN_LABEL } from "@/types/streaming";

import { EnvelopeDowngradeRow } from "./EnvelopeDowngradeRow";
import { MatchedPatternChip } from "./MatchedPatternChip";
import { MatchedTextReveal } from "./MatchedTextReveal";

/**
 * Every stream-guard halt and envelope downgrade.
 *
 * THE SHARED PATTERN SET IS DISPLAYED ON PURPOSE. The same set is enforced by
 * the backend at settle and mid-stream, so a pattern cannot be caught in one
 * place and missed in the other — and showing it here means a divergence would
 * be visible rather than silent. That is the whole reason it is on screen
 * (Surface 2 v5.0 §5.2).
 *
 * A rising hit rate is treated as retrieval or prompt drift, not as noise: the
 * guard is doing its job, but something upstream is increasingly pulling
 * content it has to stop.
 */
export function StreamGuardHitTable() {
  const query = useStreamingGovernance();
  const data = query.data;

  return (
    <div className="space-y-4">
      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        hasData={Boolean(data)}
        label="streaming governance"
        error={query.error}
      />

      {data && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Guard-hit rate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-kpi font-semibold tabular-nums text-ink-primary">
                {data.guardHitRate}%
              </p>
              <p className="text-caption text-ink-secondary">
                of streamed turns halted. A rising rate means retrieval or prompting has
                drifted — the guard is working, but it should not have this much to do.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enforced patterns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-caption text-ink-secondary">
                The single shared set. The backend enforces exactly these at settle and
                mid-stream — displayed here so a divergence would be visible.
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {GUARD_PATTERNS.map((p) => (
                  <li key={p}>
                    <Badge variant="neutral">{GUARD_PATTERN_LABEL[p]}</Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Halts</CardTitle>
            </CardHeader>
            <CardContent>
              {data.guardHits.length === 0 ? (
                <EmptyState
                  title="No halts"
                  description="No streamed turn has matched a prohibited pattern."
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Thread</TableHead>
                        <TableHead>Matched</TableHead>
                        <TableHead>What was blocked</TableHead>
                        <TableHead>Agent</TableHead>
                        <TableHead>Plane</TableHead>
                        <TableHead>Discarded</TableHead>
                        <TableHead>When</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.guardHits.map((hit) => (
                        <TableRow key={hit.id}>
                          <TableCell className="max-w-[26ch]">
                            <Link
                              href={ROUTES.thread(hit.threadId)}
                              className="line-clamp-1 text-sec text-ink-primary hover:underline"
                            >
                              {hit.threadTitle}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <MatchedPatternChip pattern={hit.pattern} />
                          </TableCell>
                          <TableCell className="max-w-[34ch]">
                            <MatchedTextReveal text={hit.matchedText} />
                          </TableCell>
                          <TableCell className="text-sec text-ink-secondary">
                            {hit.agent}
                          </TableCell>
                          <TableCell className="text-sec text-ink-secondary">
                            {hit.plane}
                          </TableCell>
                          <TableCell className="tabular-nums text-sec text-ink-secondary">
                            {hit.discardedChars} chars
                          </TableCell>
                          <TableCell className="text-micro text-ink-secondary">
                            {formatDateTime(hit.at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Envelope downgrades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-caption text-ink-secondary">
                Turns the pre-flight envelope refused to stream. Not failures — a
                level-4+ claim never streams, so the visitor saw the approved
                under-review wording immediately.
              </p>
              {data.downgrades.length === 0 ? (
                <p className="text-sec text-ink-secondary">None.</p>
              ) : (
                <ul className="space-y-1.5">
                  {data.downgrades.map((d) => (
                    <EnvelopeDowngradeRow key={d.id} downgrade={d} />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
