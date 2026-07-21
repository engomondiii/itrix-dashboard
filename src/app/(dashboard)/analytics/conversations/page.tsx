import { PageHeader } from "@/components/layout/PageHeader";
import { ConversationAnalytics } from "@/components/analytics/V5AnalyticsPanels";

export default function ConversationAnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Conversation analytics"
        description="Thread depth, turns to artifact, loop productivity and where conversations stall. Internal telemetry only."
      />
      <ConversationAnalytics />
    </>
  );
}