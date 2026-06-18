"use client";

import { useState } from "react";
import { DownloadIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { DateRangeControl } from "@/components/analytics/DateRangeControl";
import { TierDistributionChart } from "@/components/overview/TierDistributionChart";
import { ProductRouteDistribution } from "@/components/overview/ProductRouteDistribution";
import { exportLeadQualityCsv } from "@/lib/export/analytics";
import { useOverview } from "@/hooks/useAnalytics";

export default function LeadsAnalyticsPage() {
  const [days, setDays] = useState(30);
  const { data, isLoading } = useOverview(days);

  return (
    <>
      <PageHeader
        title="Lead quality"
        description="Distribution by tier and product route."
        actions={
          <div className="flex items-center gap-2">
            <DateRangeControl value={days} onChange={setDays} />
            <Button
              variant="outline"
              size="sm"
              disabled={!data}
              onClick={() => data && exportLeadQualityCsv(data)}
            >
              <DownloadIcon />
              Export
            </Button>
          </div>
        }
      />
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
