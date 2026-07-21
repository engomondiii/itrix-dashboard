import { PageHeader } from "@/components/layout/PageHeader";
import { OverviewDashboard } from "@/components/overview/OverviewDashboard";
import { JourneyDistribution } from "@/components/journey/JourneyDistribution";
import { LiveThreadsWidget } from "@/components/overview/LiveThreadsWidget";

export default function OverviewPage() {
  return (
    <>
      <PageHeader title="Overview" description="Pipeline at a glance." />
      <OverviewDashboard />
      {/* Live conversations first: a visitor waiting on an approval is more
          time-sensitive than any aggregate on this page. */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LiveThreadsWidget />
        <JourneyDistribution />
      </div>
    </>
  );
}
