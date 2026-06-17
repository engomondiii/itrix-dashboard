"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { TierDistributionChart } from "@/components/overview/TierDistributionChart";
import { ProductRouteDistribution } from "@/components/overview/ProductRouteDistribution";
import { useOverview } from "@/hooks/useAnalytics";

export default function LeadsAnalyticsPage() {
  const { data, isLoading } = useOverview();
  return (
    <>
      <PageHeader title="Lead quality" description="Distribution by tier and product route." />
      {isLoading || !data ? (
        <div className="flex justify-center py-24">
          <Spinner className="size-5" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Tier distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <TierDistributionChart dist={data.tierDistribution} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Product route</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductRouteDistribution dist={data.routeDistribution} />
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
