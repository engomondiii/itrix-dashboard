import type { LeadStatus } from "@/constants/statuses";

export function PipelineStageLabel({ status }: { status: LeadStatus }) {
  return (
    <span className="text-card-title font-semibold text-ink-primary">{status}</span>
  );
}
