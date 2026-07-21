"use client";

import { use } from "react";
import Link from "next/link";
import { ClipboardCheckIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { EvaluationDetailPanel } from "@/components/evaluations/EvaluationDetailPanel";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { ROUTES } from "@/constants/routes";
import { useEvaluation } from "@/hooks/useDeals";

export default function EvaluationDetailPage({
  params,
}: {
  params: Promise<{ evaluationId: string }>;
}) {
  const { evaluationId } = use(params);
  const { data: evaluation, isLoading, isError } = useEvaluation(evaluationId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="size-5" />
      </div>
    );
  }
  if (isError || !evaluation) {
    return (
      <EmptyState
        icon={ClipboardCheckIcon}
        title="Evaluation not found"
        action={
          <Link href={ROUTES.evaluations} className="text-sec font-medium text-ink-primary">
            Back to evaluations
          </Link>
        }
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Evaluation"
        actions={
          <Link href={ROUTES.evaluations} className="text-sec font-medium text-ink-primary">
            All evaluations
          </Link>
        }
      />
      <EvaluationDetailPanel evaluation={evaluation} />
    </>
  );
}
