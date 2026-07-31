import { PageHeader } from "@/components/layout/PageHeader";
import { AttachmentAnalytics } from "@/components/analytics/OperationalAnalyticsPanels";

export default function AttachmentAnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Attachment analytics"
        description="Upload volume, format mix, extraction outcomes and quarantine rate. Internal telemetry only."
      />
      <AttachmentAnalytics />
    </>
  );
}