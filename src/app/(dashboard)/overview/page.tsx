import { PageHeader } from "@/components/layout/PageHeader";
import { OverviewDashboard } from "@/components/overview/OverviewDashboard";

export default function OverviewPage() {
  return (
    <>
      <PageHeader title="Overview" description="Pipeline at a glance." />
      <OverviewDashboard />
    </>
  );
}
