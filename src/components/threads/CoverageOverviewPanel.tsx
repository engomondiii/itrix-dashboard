"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QueryState } from "@/components/ui/query-state";
import { useCoverageOverview } from "@/hooks/useThreads";
import {
  DIMENSION_LABEL,
  STOP_REASON_INTENT,
  STOP_REASON_LABEL,
  type StopReason,
} from "@/constants/listeningDimensions";

/**
 * Loop productivity across the whole book.
 *
 * A per-thread view can tell you a loop stopped; only the aggregate can tell you
 * WHY it keeps stopping. A dimension that is still unknown when most loops close
 * points at the question bank or the extraction, not at the visitors — which is
 * why the weakest dimensions lead and the stop-reason mix follows.
 *
 * `budget_exhausted` as a common stop reason is the finding to act on: it means
 * artifacts are routinely being generated on thinner ground than intended.
 */
export function CoverageOverviewPanel() {
  const query = useCoverageOverview();
  const data = query.data;

  return (
    <div className="space-y-4">
      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        hasData={Boolean(data)}
        label="loop productivity"
      />

      {data && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Hardest dimensions to close</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-caption text-ink-secondary">
                Across {data.threadsAnalysed} threads that got past arrival. A high
                unknown rate means the loop is not reaching this dimension — look at the
                question bank before blaming the conversations.
              </p>
              <ul className="space-y-2">
                {data.weakestDimensions.slice(0, 6).map((d) => (
                  <li key={d.dimension}>
                    <div className="flex justify-between text-caption">
                      <span className="text-ink-primary">{DIMENSION_LABEL[d.dimension]}</span>
                      <span className="tabular-nums text-ink-secondary">
                        {d.unknownRate}% unknown
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-soft">
                      <div
                        className="h-full rounded-full bg-structure-600"
                        style={{ width: `${d.unknownRate}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How loops end</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {Object.entries(data.stopReasonCounts).map(([reason, count]) => (
                  <Badge key={reason} variant={STOP_REASON_INTENT[reason as StopReason]}>
                    {count} · {STOP_REASON_LABEL[reason as StopReason]}
                  </Badge>
                ))}
              </div>
              <p className="text-sec text-ink-secondary">
                Median{" "}
                <span className="tabular-nums font-semibold text-ink-primary">
                  {data.medianQuestionsToArtifact}
                </span>{" "}
                questions before the artifact was generated.
              </p>
              <p className="text-caption text-ink-secondary">
                A loop that ends on <em>budget exhausted</em> did not finish — it ran out
                of questions. The artifact was still generated, on thinner ground.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
