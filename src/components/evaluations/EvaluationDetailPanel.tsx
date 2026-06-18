"use client";

import Link from "next/link";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

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
  const { setStatus } = useEvaluationActions(evaluation.id);

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
        <EvaluationKPIList evaluationId={evaluation.id} kpis={evaluation.kpis} />
        <Link
          href={ROUTES.lead(evaluation.leadId)}
          className="inline-block text-sec font-medium text-sapphire-600"
        >
          Open lead →
        </Link>
      </CardContent>
    </Card>
  );
}
