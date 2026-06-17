import { PageHeader } from "@/components/layout/PageHeader";
import { TemplateList } from "@/components/templates/TemplateList";

export default function EvaluationTemplatesPage() {
  return (
    <>
      <PageHeader title="Evaluation proposals" description="Paid evaluation proposal templates." />
      <TemplateList kind="evaluation" />
    </>
  );
}
