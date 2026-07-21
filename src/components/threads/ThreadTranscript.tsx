"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QueryState } from "@/components/ui/query-state";
import { StateBadge } from "@/components/journey/StateBadge";
import { useThreadDetail } from "@/hooks/useThreads";
import { ROUTES } from "@/constants/routes";
import { DISCLOSURE_CEILING_LABEL } from "@/constants/shellContract";
import { formatTimeAgo } from "@/lib/formatting";

import { AnonymousBadge } from "./AnonymousBadge";
import { ArtifactRow } from "./ArtifactRow";
import { CoverageMap } from "./CoverageMap";
import { CoverageMeter } from "./CoverageMeter";
import { QuestionHistoryTable } from "./QuestionHistoryTable";
import { StopReasonBadge } from "./StopReasonBadge";
import { TurnRow } from "./TurnRow";

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="text-micro font-semibold uppercase tracking-[0.06em] text-ink-secondary">
      {children}
    </div>
  );
}

/**
 * One thread, in full: the transcript exactly as the visitor saw it, plus the
 * internal overlay they never see (coverage, question history, citations,
 * envelope levels, guard halts).
 *
 * THE TWO LAYERS ARE KEPT VISUALLY SEPARATE ON PURPOSE. An operator who is
 * about to intervene must be able to tell at a glance which side of the line a
 * given fact sits on — pasting an internal signal into a live thread is the
 * first item on the "what the team must never do from here" list
 * (Surface 2 v5.0 §3.3).
 */
export function ThreadTranscript({ threadId }: { threadId: string }) {
  const query = useThreadDetail(threadId);
  const detail = query.data;

  return (
    <div className="space-y-4">
      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        hasData={Boolean(detail)}
        label="this thread"
        error={query.error}
      />

      {detail && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{detail.thread.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <AnonymousBadge identityState={detail.thread.identityState} />
                <StateBadge state={detail.thread.state} />
                <Badge variant="neutral">
                  {DISCLOSURE_CEILING_LABEL[detail.disclosureCeiling]}
                </Badge>
                {detail.thread.live && <Badge variant="success">Live now</Badge>}
                {detail.thread.blocking && (
                  <Badge variant="error" className="tabular-nums">
                    blocking a visitor · {Math.floor(detail.thread.blocking.waitingSeconds / 60)}m
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-caption text-ink-secondary">
                <span>Last activity {formatTimeAgo(detail.thread.lastActivityAt)}</span>
                <span>
                  Owner:{" "}
                  {detail.thread.humanOwner ?? (
                    <span className="text-ink-muted">unassigned</span>
                  )}
                </span>
                {detail.thread.leadId ? (
                  <Link
                    href={ROUTES.lead(detail.thread.leadId)}
                    className="font-medium text-ink-primary hover:underline"
                  >
                    Open the lead →
                  </Link>
                ) : (
                  <span className="text-ink-muted">
                    No lead yet — this visitor has not been qualified
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <Card>
              <CardHeader>
                <CardTitle>Transcript</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-caption text-ink-secondary">
                  What the visitor saw, in order.
                </p>
                <ul className="space-y-2">
                  {detail.turns.map((turn) => (
                    <TurnRow key={turn.id} turn={turn} />
                  ))}
                </ul>

                {detail.artifacts.length > 0 && (
                  <div className="space-y-2">
                    <SectionLabel>Artifacts delivered</SectionLabel>
                    <ul className="space-y-1.5">
                      {detail.artifacts.map((a) => (
                        <ArtifactRow key={a.id} artifact={a} />
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Internal overlay</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-caption text-ink-secondary">
                    Never visible to the visitor. Do not paste any of it into an
                    intervention.
                  </p>

                  <div className="space-y-2">
                    <SectionLabel>Loop</SectionLabel>
                    <div className="flex flex-wrap items-center gap-2">
                      {detail.thread.loop.open ? (
                        <Badge variant="info">Open</Badge>
                      ) : (
                        <StopReasonBadge stopReason={detail.thread.loop.stopReason} />
                      )}
                      <span className="text-caption tabular-nums text-ink-secondary">
                        {detail.thread.loop.questionsAsked} asked ·{" "}
                        {detail.thread.loop.budgetRemaining} of budget left
                      </span>
                    </div>
                    <CoverageMeter
                      covered={detail.thread.coverage.covered}
                      partial={detail.thread.coverage.partial}
                      unknown={detail.thread.coverage.unknown}
                    />
                  </div>

                  <div className="space-y-2">
                    <SectionLabel>Coverage map</SectionLabel>
                    <CoverageMap entries={detail.coverageMap} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Question history</CardTitle>
                </CardHeader>
                <CardContent>
                  <QuestionHistoryTable entries={detail.questionHistory} />
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
