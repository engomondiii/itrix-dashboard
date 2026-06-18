"use client";

import { useState } from "react";
import { DownloadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { CommonBottlenecksList } from "@/components/analytics/CommonBottlenecksList";
import { ConversionRateTable } from "@/components/analytics/ConversionRateTable";
import { DateRangeControl } from "@/components/analytics/DateRangeControl";
import { FunnelChart } from "@/components/analytics/FunnelChart";
import { IndustryBreakdownChart } from "@/components/analytics/IndustryBreakdownChart";
import { SLAComplianceChart } from "@/components/analytics/SLAComplianceChart";
import {
  exportBottlenecksCsv,
  exportFunnelCsv,
  exportResponseTimeCsv,
} from "@/lib/export/analytics";
import { useBottlenecks, useFunnel, useResponseTime } from "@/hooks/useAnalytics";

export function AnalyticsDashboard() {
  const [days, setDays] = useState(30);
  const funnel = useFunnel(days);
  const rt = useResponseTime(days);
  const bn = useBottlenecks(days);

  const loading = funnel.isLoading || rt.isLoading || bn.isLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <DateRangeControl value={days} onChange={setDays} />
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
            <DownloadIcon />
            Export
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              disabled={!funnel.data}
              onClick={() => funnel.data && exportFunnelCsv(funnel.data.stages)}
            >
              Funnel (CSV)
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!rt.data}
              onClick={() => rt.data && exportResponseTimeCsv(rt.data)}
            >
              Response time (CSV)
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!bn.data}
              onClick={() =>
                bn.data && exportBottlenecksCsv(bn.data.bottlenecks, bn.data.industries)
              }
            >
              Bottlenecks (CSV)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner className="size-5" />
        </div>
      ) : (
        <>
          {rt.data && <SLAComplianceChart metrics={rt.data} />}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Conversion funnel</CardTitle>
              </CardHeader>
              <CardContent>
                {funnel.data && <FunnelChart stages={funnel.data.stages} />}
              </CardContent>
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
              <CardContent>
                {bn.data && <CommonBottlenecksList data={bn.data.bottlenecks} />}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
