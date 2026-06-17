import Link from "next/link";

import { EvaluationPackageBadge } from "@/components/evaluations/EvaluationPackageBadge";
import { EvaluationStatusTracker } from "@/components/evaluations/EvaluationStatusTracker";
import { ROUTES } from "@/constants/routes";
import type { Evaluation } from "@/types/evaluation";

export function EvaluationCard({ evaluation }: { evaluation: Evaluation }) {
  return (
    <Link
      href={ROUTES.evaluation(evaluation.id)}
      className="block rounded-md border border-line bg-surface p-4 shadow-1 transition-colors hover:border-sapphire-300"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sec font-medium text-ink-900">
          {evaluation.leadName}
        </span>
        <EvaluationStatusTracker status={evaluation.status} />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <EvaluationPackageBadge pkg={evaluation.pkg} />
        <span className="text-caption text-ink-400 tabular-nums">
          {evaluation.kpis.length} KPIs
        </span>
      </div>
    </Link>
  );
}
