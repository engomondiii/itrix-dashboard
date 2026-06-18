"use client";

import { useState } from "react";
import { DownloadIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ConversionRateTable } from "@/components/analytics/ConversionRateTable";
import { DateRangeControl } from "@/components/analytics/DateRangeControl";
import { FunnelChart } from "@/components/analytics/FunnelChart";
import { exportFunnelCsv } from "@/lib/export/analytics";
import { useFunnel } from "@/hooks/useAnalytics";

export default function FunnelAnalyticsPage() {
  const [days, setDays] = useState(30);
  const { data, isLoading } = useFunnel(days);

  return (
    <>
      <PageHeader
        title="Conversion funnel"
        description="Leads reaching each stage."
        actions={
          <div className="flex items-center gap-2">
            <DateRangeControl value={days} onChange={setDays} />
            <Button
              variant="outline"
              size="sm"
              disabled={!data}
              onClick={() => data && exportFunnelCsv(data.stages)}
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
