"use client";

import { use } from "react";
import Link from "next/link";
import { KanbanSquareIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { PipelineCard } from "@/components/pipeline/PipelineCard";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { ROUTES } from "@/constants/routes";
import { slugToStatus } from "@/constants/statuses";
import { usePipeline } from "@/hooks/usePipeline";

export default function PipelineStagePage({
  params,
}: {
  params: Promise<{ stageId: string }>;
}) {
  const { stageId } = use(params);
  const status = slugToStatus(stageId);
  const { data, isLoading } = usePipeline();

  if (!status) {
    return (
      <EmptyState
        icon={KanbanSquareIcon}
        title="Unknown pipeline stage"
        action={
          <Link href={ROUTES.pipeline} className="text-sec font-medium text-sapphire-600">
            Back to pipeline
          </Link>
        }
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="size-5" />
      </div>
    );
  }

  const stage = data?.stages.find((s) => s.status === status);
  const leads = stage?.leads ?? [];

  return (
    <>
      <PageHeader
        title={status}
        description={`${leads.length} lead${leads.length === 1 ? "" : "s"} in this stage.`}
        actions={
          <Link href={ROUTES.pipeline} className="text-sec font-medium text-sapphire-600">
            All stages
          </Link>
        }
      />
      {leads.length === 0 ? (
        <EmptyState icon={KanbanSquareIcon} title="No leads in this stage" />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {leads.map((card) => (
            <PipelineCard key={card.id} card={card} />
          ))}
        </div>
      )}
    </>
  );
}
