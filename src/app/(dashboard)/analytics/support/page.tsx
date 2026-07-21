import { PageHeader } from "@/components/layout/PageHeader";
import { SupportAnalytics } from "@/components/analytics/V5AnalyticsPanels";

export default function SupportAnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Support analytics"
        description="Queue depth, SLA compliance, and the gap between resolved and confirmed."
      />
      <SupportAnalytics />
    </>
  );
}