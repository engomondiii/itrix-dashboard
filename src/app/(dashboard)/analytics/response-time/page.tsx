"use client";

import { useState } from "react";
import { DownloadIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { DateRangeControl } from "@/components/analytics/DateRangeControl";
import { SLAComplianceChart } from "@/components/analytics/SLAComplianceChart";
import { exportResponseTimeCsv } from "@/lib/export/analytics";
import { useResponseTime } from "@/hooks/useAnalytics";

export default function ResponseTimeAnalyticsPage() {
  const [days, setDays] = useState(30);
  const { data, isLoading } = useResponseTime(days);

  return (
    <>
      <PageHeader
        title="Response time"
        description="SLA compliance — Tier 1 (24h) and Tier 2 (48h)."
        actions={
          <div className="flex items-center gap-2">
            <DateRangeControl value={days} onChange={setDays} />
            <Button
              variant="outline"
              size="sm"
              disabled={!data}
              onClick={() => data && exportResponseTimeCsv(data)}
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
        <SLAComplianceChart metrics={data} />
      )}
    </>
  );
}
