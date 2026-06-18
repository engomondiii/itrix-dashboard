import Link from "next/link";

import { PipelineCard } from "@/components/pipeline/PipelineCard";
import { PipelineStageLabel } from "@/components/pipeline/PipelineStageLabel";
import { PipelineColumnCount } from "@/components/pipeline/PipelineColumnCount";
import { ROUTES } from "@/constants/routes";
import { statusToSlug } from "@/constants/statuses";
import type { PipelineStage } from "@/types/pipeline";

export function PipelineColumn({ stage }: { stage: PipelineStage }) {
  return (
    <div className="flex w-[80vw] max-w-72 shrink-0 flex-col rounded-md bg-canvas-deep sm:w-72">
      <Link
        href={ROUTES.pipelineStage(statusToSlug(stage.status))}
        className="flex items-center justify-between gap-2 px-3 py-2.5 hover:opacity-80"
      >
        <PipelineStageLabel status={stage.status} />
        <PipelineColumnCount count={stage.count} />
      </Link>
      <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-3">
        {stage.leads.length === 0 ? (
          <p className="px-1 py-4 text-center text-caption text-ink-400">No leads</p>
        ) : (
          stage.leads.map((card) => (
            <PipelineCard key={card.id} card={card} currentStatus={stage.status} />
          ))
        )}
      </div>
    </div>
  );
}
