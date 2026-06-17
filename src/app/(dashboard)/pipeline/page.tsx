import { PageHeader } from "@/components/layout/PageHeader";
import { PipelineBoard } from "@/components/pipeline/PipelineBoard";

export default function PipelinePage() {
  return (
    <>
      <PageHeader
        title="Pipeline"
        description="Leads by stage. Overdue Tier 1/2 leads are flagged with a red bar."
      />
      <PipelineBoard />
    </>
  );
}
