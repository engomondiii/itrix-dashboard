"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { CommonBottlenecksList } from "@/components/analytics/CommonBottlenecksList";
import { IndustryBreakdownChart } from "@/components/analytics/IndustryBreakdownChart";
import { useBottlenecks } from "@/hooks/useAnalytics";

export default function BottlenecksAnalyticsPage() {
  const { data, isLoading } = useBottlenecks();
  return (
    <>
      <PageHeader
        title="Bottlenecks"
        description="Most common compute bottlenecks and demand by industry."
      />
      {isLoading || !data ? (
        <div className="flex justify-center py-24">
          <Spinner className="size-5" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Common bottlenecks</CardTitle>
            </CardHeader>
            <CardContent>
              <CommonBottlenecksList data={data.bottlenecks} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Leads by industry</CardTitle>
            </CardHeader>
            <CardContent>
              <IndustryBreakdownChart data={data.industries} />
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
