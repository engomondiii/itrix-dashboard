import { PageHeader } from "@/components/layout/PageHeader";
import { EvaluationList } from "@/components/evaluations/EvaluationList";

export default function EvaluationsPage() {
  return (
    <>
      <PageHeader title="Evaluations" description="Paid ALPHA assessments in progress." />
      <EvaluationList />
    </>
  );
}
