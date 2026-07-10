"use client";

import { useState } from "react";
import { DownloadIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QueryState } from "@/components/ui/query-state";
import { CommonBottlenecksList } from "@/components/analytics/CommonBottlenecksList";
import { DateRangeControl } from "@/components/analytics/DateRangeControl";
import { IndustryBreakdownChart } from "@/components/analytics/IndustryBreakdownChart";
import { exportBottlenecksCsv } from "@/lib/export/analytics";
import { useBottlenecks } from "@/hooks/useAnalytics";

export default function BottlenecksAnalyticsPage() {
  const [days, setDays] = useState(30);
  const { data, isLoading, isError } = useBottlenecks(days);

  return (
    <>
      <PageHeader
        title="Bottlenecks"
        description="Most common compute bottlenecks and demand by industry."
        actions={
          <div className="flex items-center gap-2">
            <DateRangeControl value={days} onChange={setDays} />
            <Button
              variant="outline"
              size="sm"
              disabled={!data}
              onClick={() => data && exportBottlenecksCsv(data.bottlenecks, data.industries)}
            >
              <DownloadIcon />
              Export
            </Button>
          </div>
        }
      />
      {!data ? (
        <QueryState
          isLoading={isLoading}
          isError={isError}
          hasData={false}
          label="this report"
        />
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
