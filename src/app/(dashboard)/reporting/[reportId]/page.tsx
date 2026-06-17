"use client";

import { use } from "react";
import Link from "next/link";
import { FileTextIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { ReportView } from "@/components/reporting/ReportView";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { ROUTES } from "@/constants/routes";
import { useReport } from "@/hooks/useReporting";

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = use(params);
  const { data, isLoading, isError } = useReport(reportId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="size-5" />
      </div>
    );
  }
  if (isError || !data) {
    return (
      <EmptyState
        icon={FileTextIcon}
        title="Report not found"
        action={
          <Link href={ROUTES.reporting} className="text-sec font-medium text-sapphire-600">
            Back to reporting
          </Link>
        }
      />
    );
  }

  return (
    <>
      <PageHeader
        title={`Report · ${data.month}`}
        actions={
          <Link href={ROUTES.reporting} className="text-sec font-medium text-sapphire-600">
            All reports
          </Link>
        }
      />
      <ReportView report={data} />
    </>
  );
}
