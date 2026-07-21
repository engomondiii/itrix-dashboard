import { PageHeader } from "@/components/layout/PageHeader";
import { StreamingAnalytics } from "@/components/analytics/V5AnalyticsPanels";

export default function StreamingAnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Streaming analytics"
        description="Envelope downgrades, guard halts and settle-time replacements. A rising hit rate is drift, not noise."
      />
      <StreamingAnalytics />
    </>
  );
}