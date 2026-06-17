import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EvaluationPackageBadge } from "@/components/evaluations/EvaluationPackageBadge";
import { EvaluationStatusTracker } from "@/components/evaluations/EvaluationStatusTracker";
import { EvaluationKPIList } from "@/components/evaluations/EvaluationKPIList";
import { ROUTES } from "@/constants/routes";
import type { Evaluation } from "@/types/evaluation";

export function EvaluationDetailPanel({ evaluation }: { evaluation: Evaluation }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>{evaluation.leadName}</CardTitle>
          <div className="flex items-center gap-2">
            <EvaluationPackageBadge pkg={evaluation.pkg} />
            <EvaluationStatusTracker status={evaluation.status} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <EvaluationKPIList kpis={evaluation.kpis} />
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
