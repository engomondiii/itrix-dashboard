"use client";

import Link from "next/link";
import { CheckIcon, ChevronDownIcon, FlaskConicalIcon } from "lucide-react";

import { EvaluationKPIList } from "@/components/evaluations/EvaluationKPIList";
import { EvaluationPackageBadge } from "@/components/evaluations/EvaluationPackageBadge";
import { EvaluationStatusTracker } from "@/components/evaluations/EvaluationStatusTracker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/constants/routes";
import { useEvaluationActions } from "@/hooks/useDeals";
import {
  EVALUATION_STATUSES,
  EVALUATION_STATUS_LABELS,
  type Evaluation,
} from "@/types/evaluation";

export function EvaluationDetailPanel({ evaluation }: { evaluation: Evaluation }) {
  const { setStatus, convertToPoC } = useEvaluationActions(evaluation.id);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>{evaluation.leadName}</CardTitle>
          <div className="flex items-center gap-2">
            <EvaluationPackageBadge pkg={evaluation.pkg} />
            <EvaluationStatusTracker status={evaluation.status} />
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="outline" size="sm" disabled={setStatus.isPending} />}
              >
                Change status
                <ChevronDownIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {EVALUATION_STATUSES.map((s) => (
                  <DropdownMenuItem key={s} onClick={() => setStatus.mutate(s)}>
                    {EVALUATION_STATUS_LABELS[s]}
                    {s === evaluation.status && <CheckIcon className="ml-auto" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {(evaluation.scope || evaluation.fee || evaluation.timeline) && (
          <div className="space-y-2 rounded-md border border-border-soft bg-soft p-3">
            {evaluation.scope && (
              <div>
                <div className="text-micro font-semibold uppercase tracking-[0.06em] text-ink-secondary">
                  Scope
                </div>
                <p className="text-sec text-ink-secondary">{evaluation.scope}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sec text-ink-secondary">
              {evaluation.fee && (
                <span>
                  <span className="text-ink-secondary">Fee:</span> {evaluation.fee}
                </span>
              )}
              {evaluation.timeline && (
                <span>
                  <span className="text-ink-secondary">Timeline:</span> {evaluation.timeline}
                </span>
              )}
            </div>
          </div>
        )}
        <EvaluationKPIList evaluationId={evaluation.id} kpis={evaluation.kpis} />
        {evaluation.status === "won" && (
          <div className="rounded-md border border-border-soft bg-soft p-3">
            <p className="text-sec text-ink-secondary">
              This evaluation was won. Graduate the lead to a proof-of-concept.
            </p>
            <Button
              size="sm"
              className="mt-2"
              // Stays disabled after it succeeds: the button remains rendered while
              // we navigate away, and a second click would create a duplicate PoC.
              disabled={convertToPoC.isPending || convertToPoC.isSuccess}
              onClick={() => convertToPoC.mutate(evaluation.leadId)}
            >
              <FlaskConicalIcon />
              Create PoC from this evaluation
            </Button>
          </div>
        )}
        <Link
          href={ROUTES.lead(evaluation.leadId)}
          className="inline-block text-sec font-medium text-ink-primary"
        >
          Open lead →
        </Link>
      </CardContent>
    </Card>
  );
}
