import { PageHeader } from "@/components/layout/PageHeader";
import { CustomerAnalytics } from "@/components/analytics/V5AnalyticsPanels";

export default function CustomerAnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Customer analytics"
        description="Health distribution and adoption across every customer from the first payment onward."
      />
      <CustomerAnalytics />
    </>
  );
}