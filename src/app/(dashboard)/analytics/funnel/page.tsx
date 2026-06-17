"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { FunnelChart } from "@/components/analytics/FunnelChart";
import { ConversionRateTable } from "@/components/analytics/ConversionRateTable";
import { useFunnel } from "@/hooks/useAnalytics";

export default function FunnelAnalyticsPage() {
  const { data, isLoading } = useFunnel();
  return (
    <>
      <PageHeader title="Conversion funnel" description="Leads reaching each stage." />
      {isLoading || !data ? (
        <div className="flex justify-center py-24">
          <Spinner className="size-5" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <FunnelChart stages={data.stages} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Conversion by stage</CardTitle>
            </CardHeader>
            <CardContent>
              <ConversionRateTable stages={data.stages} />
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
