import Link from "next/link";

import { PageHeader } from "@/components/layout/PageHeader";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { ROUTES } from "@/constants/routes";

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Analytics"
        description="Funnel, SLA compliance, and demand signals."
        actions={
          <div className="flex items-center gap-3 text-sec text-ink-secondary">
            <Link href={ROUTES.analyticsFunnel} className="hover:text-ink-secondary">Funnel</Link>
            <Link href={ROUTES.analyticsResponseTime} className="hover:text-ink-secondary">SLA</Link>
            <Link href={ROUTES.analyticsLeads} className="hover:text-ink-secondary">Leads</Link>
            <Link href={ROUTES.analyticsBottlenecks} className="hover:text-ink-secondary">Bottlenecks</Link>
          </div>
        }
      />
      <AnalyticsDashboard />
    </>
  );
}
