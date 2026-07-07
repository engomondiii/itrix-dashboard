import { PageHeader } from "@/components/layout/PageHeader";
import { OverviewDashboard } from "@/components/overview/OverviewDashboard";
import { JourneyDistribution } from "@/components/journey/JourneyDistribution";

export default function OverviewPage() {
  return (
    <>
      <PageHeader title="Overview" description="Pipeline at a glance." />
      <OverviewDashboard />
      <div className="mt-6">
        <JourneyDistribution />
      </div>
    </>
  );
}
