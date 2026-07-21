import Link from "next/link";

import { EvaluationPackageBadge } from "@/components/evaluations/EvaluationPackageBadge";
import { EvaluationStatusTracker } from "@/components/evaluations/EvaluationStatusTracker";
import { ROUTES } from "@/constants/routes";
import type { Evaluation } from "@/types/evaluation";

export function EvaluationCard({ evaluation }: { evaluation: Evaluation }) {
  return (
    <Link
      href={ROUTES.evaluation(evaluation.id)}
      className="block rounded-md border border-border-soft bg-surface p-4 shadow-1 transition-colors hover:border-signature-soft"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sec font-medium text-ink-primary">
          {evaluation.leadName}
        </span>
        <EvaluationStatusTracker status={evaluation.status} />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <EvaluationPackageBadge pkg={evaluation.pkg} />
        <span className="text-caption text-ink-secondary tabular-nums">
          {evaluation.kpis.length} KPIs
        </span>
      </div>
    </Link>
  );
}
