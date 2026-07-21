"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QueryState } from "@/components/ui/query-state";
import { useCoverageOverview } from "@/hooks/useThreads";
import { useThreads } from "@/hooks/useThreads";
import { useAttachmentQueue } from "@/hooks/useAttachments";
import { useCustomers } from "@/hooks/useCustomers";
import { useSupportQueue } from "@/hooks/useSupport";
import { useStreamingGovernance } from "@/hooks/useStreamingGovernance";
import {
  DIMENSION_LABEL,
  STOP_REASON_INTENT,
  STOP_REASON_LABEL,
  type StopReason,
} from "@/constants/listeningDimensions";
import { GUARD_PATTERN_LABEL } from "@/types/streaming";
import { OUTCOME_STATUSES, OUTCOME_STATUS_INTENT } from "@/types/customer";
import { SCAN_VERDICT_LABEL } from "@/types/attachment";
import { useAllOutcomes } from "@/hooks/useCustomers";

/**
 * The six v5.0 analytics panels.
 *
 * These are INTERNAL TELEMETRY, like every other number on this surface. They
 * are grouped in one module because they share a shape — a small aggregate over
 * data the operational views already fetch — and because each one exists to
 * answer a single question that the per-record views cannot.
 *
 * Every panel reuses the operational hooks rather than adding parallel
 * analytics endpoints. That keeps a chart from disagreeing with the queue it
 * summarises, which is the failure that makes people stop trusting dashboards.
 */

function StatRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-sec text-ink-secondary">{label}</span>
      <span className="text-sec font-semibold tabular-nums text-ink-primary">{value}</span>
    </div>
  );
}

function Bar({ label, percent }: { label: string; percent: number }) {
  return (
    <div>
      <div className="flex justify-between text-caption text-ink-secondary">
        <span>{label}</span>
        <span className="tabular-nums">{percent}%</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-soft">
        <div
          className="h-full rounded-full bg-structure-600"
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
    </div>
  );
}

/** Conversation depth, loop productivity and how loops end. */
export function ConversationAnalytics() {
  const threadsQuery = useThreads();
  const coverageQuery = useCoverageOverview();
  const threads = threadsQuery.data;
  const coverage = coverageQuery.data;

  const anonymous = (threads ?? []).filter((t) => t.identityState === "anonymous").length;
  const abandoned = (threads ?? []).filter(
    (t) => !t.live && (t.journeyNumber ?? 1) <= 2,
  ).length;

  return (
    <div className="space-y-4">
      <QueryState
        isLoading={threadsQuery.isLoading || coverageQuery.isLoading}
        isError={threadsQuery.isError || coverageQuery.isError}
        hasData={Boolean(threads && coverage)}
        label="conversation analytics"
        error={threadsQuery.error ?? coverageQuery.error}
      />

      {threads && coverage && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Threads</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <StatRow label="Total" value={threads.length} />
              <StatRow label="Anonymous" value={anonymous} />
              <StatRow label="Live now" value={threads.filter((t) => t.live).length} />
              <StatRow label="Stalled at listening" value={abandoned} />
              <p className="pt-2 text-caption text-ink-secondary">
                A thread stalled at state 1–2 is a visitor who spoke once and never came
                back. That is the number the minimal landing is meant to move.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Question loop</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <StatRow
                label="Median questions to artifact"
                value={coverage.medianQuestionsToArtifact}
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {Object.entries(coverage.stopReasonCounts).map(([reason, count]) => (
                  <Badge key={reason} variant={STOP_REASON_INTENT[reason as StopReason]}>
                    {count} · {STOP_REASON_LABEL[reason as StopReason]}
                  </Badge>
                ))}
              </div>
              <p className="text-caption text-ink-secondary">
                Loops ending on <em>budget exhausted</em> produced an artifact on thinner
                ground than intended.
              </p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Hardest dimensions to close</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {coverage.weakestDimensions.slice(0, 6).map((d) => (
                <Bar
                  key={d.dimension}
                  label={DIMENSION_LABEL[d.dimension]}
                  percent={d.unknownRate}
                />
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

/** Upload volume, format mix, extraction success and quarantine rate. */
export function AttachmentAnalytics() {
  const query = useAttachmentQueue();
  const rows = query.data;

  const byVerdict = new Map<string, number>();
  const byHandler = new Map<string, number>();
  for (const a of rows ?? []) {
    byVerdict.set(a.scan.verdict, (byVerdict.get(a.scan.verdict) ?? 0) + 1);
    const handler = a.extraction?.handler ?? "not extracted";
    byHandler.set(handler, (byHandler.get(handler) ?? 0) + 1);
  }

  const total = rows?.length ?? 0;
  const quarantined = (rows ?? []).filter((a) => a.status === "quarantined").length;
  const opaque = (rows ?? []).filter((a) => a.extraction?.handler === "opaque").length;

  return (
    <div className="space-y-4">
      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        hasData={Boolean(rows)}
        label="attachment analytics"
        error={query.error}
      />

      {rows && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Volume</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <StatRow label="Uploaded" value={total} />
              <StatRow label="Quarantined" value={quarantined} />
              <StatRow label="Accepted, metadata only" value={opaque} />
              <p className="pt-2 text-caption text-ink-secondary">
                An opaque file is not a failure — it uploaded, it just has no text
                handler. Counting it as an error would misreport the extraction rate.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scan outcomes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {[...byVerdict.entries()].map(([verdict, count]) => (
                <StatRow
                  key={verdict}
                  label={SCAN_VERDICT_LABEL[verdict as keyof typeof SCAN_VERDICT_LABEL]}
                  value={count}
                />
              ))}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Format mix</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[...byHandler.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([handler, count]) => (
                  <Bar
                    key={handler}
                    label={handler}
                    percent={total ? Math.round((count / total) * 100) : 0}
                  />
                ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

/** Envelope downgrades, guard halts and the drift signal. */
export function StreamingAnalytics() {
  const query = useStreamingGovernance();
  const data = query.data;

  const byPattern = new Map<string, number>();
  for (const hit of data?.guardHits ?? []) {
    byPattern.set(hit.pattern, (byPattern.get(hit.pattern) ?? 0) + 1);
  }

  return (
    <div className="space-y-4">
      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        hasData={Boolean(data)}
        label="streaming analytics"
        error={query.error}
      />

      {data && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Guard-hit rate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-kpi font-semibold tabular-nums text-ink-primary">
                {data.guardHitRate}%
              </p>
              <p className="text-caption text-ink-secondary">
                Treated as retrieval or prompt drift, not noise. The guard is a hard stop
                — it should rarely have anything to do.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Governance events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <StatRow label="Halts" value={data.guardHits.length} />
              <StatRow label="Envelope downgrades" value={data.downgrades.length} />
              <StatRow label="Blocking a live visitor" value={data.blocking.length} />
            </CardContent>
          </Card>

          {byPattern.size > 0 && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>What is being caught</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {[...byPattern.entries()]
                  .sort((a, b) => b[1] - a[1])
                  .map(([pattern, count]) => (
                    <StatRow
                      key={pattern}
                      label={
                        GUARD_PATTERN_LABEL[pattern as keyof typeof GUARD_PATTERN_LABEL]
                      }
                      value={count}
                    />
                  ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

/** Customer health distribution. */
export function CustomerAnalytics() {
  const query = useCustomers();
  const rows = query.data;

  const total = rows?.length ?? 0;
  const atRisk = (rows ?? []).filter((c) => c.healthClass === "at_risk").length;
  const watch = (rows ?? []).filter((c) => c.healthClass === "watch").length;
  const avgAdoption = total
    ? Math.round((rows ?? []).reduce((s, c) => s + c.adoptionPercent, 0) / total)
    : 0;

  return (
    <div className="space-y-4">
      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        hasData={Boolean(rows)}
        label="customer analytics"
        error={query.error}
      />

      {rows && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <StatRow label="Customers" value={total} />
              <StatRow label="At risk" value={atRisk} />
              <StatRow label="Watch" value={watch} />
              <StatRow label="Stable" value={total - atRisk - watch} />
              <p className="pt-2 text-caption text-ink-secondary">
                Counted from the first payment onward, not from license-out.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Adoption</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-kpi font-semibold tabular-nums text-ink-primary">
                {avgAdoption}%
              </p>
              <p className="text-caption text-ink-secondary">
                Mean adoption across the book. Below-plan adoption suppresses commercial
                actions — selling more of something half-used does not help anyone.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

/** Support load, SLA compliance and how much is blocking. */
export function SupportAnalytics() {
  const query = useSupportQueue();
  const data = query.data;

  const resolved = (data?.results ?? []).filter((r) => r.status === "resolved").length;
  const confirmed = (data?.results ?? []).filter(
    (r) => r.customerConfirmedResolved === true,
  ).length;

  return (
    <div className="space-y-4">
      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        hasData={Boolean(data)}
        label="support analytics"
        error={query.error}
      />

      {data && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Queue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <StatRow label="Open" value={data.summary.open} />
              <StatRow label="Breaching SLA" value={data.summary.breaching} />
              <StatRow label="Blocking" value={data.summary.blocking} />
              <p className="pt-2 text-caption text-ink-secondary">
                Every blocking request suppresses commercial actions for its customer
                until it clears.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resolution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <StatRow label="Resolved" value={resolved} />
              <StatRow label="Customer confirmed it helped" value={confirmed} />
              <p className="pt-2 text-caption text-ink-secondary">
                “Resolved” is our word; “confirmed” is theirs. The gap between the two is
                the number worth watching.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

/** Outcome status distribution across the book. */
export function OutcomeAnalytics() {
  const query = useAllOutcomes();
  const outcomes = query.data;
  const total = outcomes?.length ?? 0;

  return (
    <div className="space-y-4">
      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        hasData={Boolean(outcomes)}
        label="outcome analytics"
        error={query.error}
      />

      {outcomes && (
        <Card>
          <CardHeader>
            <CardTitle>Agreed outcomes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {OUTCOME_STATUSES.map((status) => {
                const count = outcomes.filter((o) => o.status === status).length;
                if (count === 0) return null;
                return (
                  <Badge key={status} variant={OUTCOME_STATUS_INTENT[status]}>
                    {count} {status.toLowerCase()}
                  </Badge>
                );
              })}
            </div>
            {OUTCOME_STATUSES.map((status) => {
              const count = outcomes.filter((o) => o.status === status).length;
              return (
                <Bar
                  key={status}
                  label={status}
                  percent={total ? Math.round((count / total) * 100) : 0}
                />
              );
            })}
            <p className="pt-1 text-caption text-ink-secondary">
              These are the customers’ outcomes, not sales targets. An outcome off plan
              suppresses commercial actions for that customer.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
