import { PageHeader } from "@/components/layout/PageHeader";
import { OutcomeBookView } from "@/components/customers/OutcomeBookView";

export default function CustomerOutcomesPage() {
  return (
    <>
      <PageHeader
        title="Outcomes"
        description="Every outcome agreed with a paying customer, across the book. Anything off plan leads."
      />
      <OutcomeBookView />
    </>
  );
}