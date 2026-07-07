import { PageHeader } from "@/components/layout/PageHeader";
import { PitchEngagementChart } from "@/components/cockpit/PitchEngagementChart";

export default function PitchAnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Pitch analytics"
        description="Pitch-room engagement across leads — opened, CTA clicks, questions, by pitch type. Internal only."
      />
      <PitchEngagementChart />
    </>
  );
}
