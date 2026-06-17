"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { FunnelChart } from "@/components/analytics/FunnelChart";
import { ConversionRateTable } from "@/components/analytics/ConversionRateTable";
import { SLAComplianceChart } from "@/components/analytics/SLAComplianceChart";
import { IndustryBreakdownChart } from "@/components/analytics/IndustryBreakdownChart";
import { CommonBottlenecksList } from "@/components/analytics/CommonBottlenecksList";
import { useBottlenecks, useFunnel, useResponseTime } from "@/hooks/useAnalytics";

export function AnalyticsDashboard() {
  const funnel = useFunnel();
  const rt = useResponseTime();
  const bn = useBottlenecks();

  const loading = funnel.isLoading || rt.isLoading || bn.isLoading;
  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="size-5" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {rt.data && <SLAComplianceChart metrics={rt.data} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Conversion funnel</CardTitle>
          </CardHeader>
          <CardContent>{funnel.data && <FunnelChart stages={funnel.data.stages} />}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Stage conversion</CardTitle>
          </CardHeader>
          <CardContent>
            {funnel.data && <ConversionRateTable stages={funnel.data.stages} />}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leads by industry</CardTitle>
          </CardHeader>
          <CardContent>
            {bn.data && <IndustryBreakdownChart data={bn.data.industries} />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Common bottlenecks</CardTitle>
          </CardHeader>
          <CardContent>{bn.data && <CommonBottlenecksList data={bn.data.bottlenecks} />}</CardContent>
        </Card>
      </div>
    </div>
  );
}
