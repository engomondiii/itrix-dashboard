"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Spinner } from "@/components/ui/spinner";
import { SLAComplianceChart } from "@/components/analytics/SLAComplianceChart";
import { useResponseTime } from "@/hooks/useAnalytics";

export default function ResponseTimeAnalyticsPage() {
  const { data, isLoading } = useResponseTime();
  return (
    <>
      <PageHeader
        title="Response time"
        description="SLA compliance — Tier 1 (24h) and Tier 2 (48h)."
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
