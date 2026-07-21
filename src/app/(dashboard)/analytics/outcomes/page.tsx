import { PageHeader } from "@/components/layout/PageHeader";
import { OutcomeAnalytics } from "@/components/analytics/V5AnalyticsPanels";

export default function OutcomeAnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Outcome analytics"
        description="Where every agreed customer outcome stands across the book."
      />
      <OutcomeAnalytics />
    </>
  );
}