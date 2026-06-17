"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { PipelineSummaryCards } from "@/components/overview/PipelineSummaryCards";
import { OverviewAlerts } from "@/components/overview/OverviewAlerts";
import { RecentLeadsFeed } from "@/components/overview/RecentLeadsFeed";
import { TierDistributionChart } from "@/components/overview/TierDistributionChart";
import { ProductRouteDistribution } from "@/components/overview/ProductRouteDistribution";
import { WeeklySubmissionChart } from "@/components/overview/WeeklySubmissionChart";
import { useOverview } from "@/hooks/useAnalytics";
import { LayoutDashboardIcon } from "lucide-react";

export function OverviewDashboard() {
  const { data: m, isLoading, isError } = useOverview();

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="size-5" />
      </div>
    );
  }
  if (isError || !m) {
    return <EmptyState icon={LayoutDashboardIcon} title="Could not load overview" />;
  }

  return (
    <div className="space-y-6">
      <PipelineSummaryCards m={m} />
      <OverviewAlerts newLeads={m.newLeads} overdue={m.overdueFollowUps} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Tier distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <TierDistributionChart dist={m.tierDistribution} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Product route</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductRouteDistribution dist={m.routeDistribution} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Submissions (7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklySubmissionChart data={m.weeklySubmissions} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent leads</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentLeadsFeed />
        </CardContent>
      </Card>
    </div>
  );
}
