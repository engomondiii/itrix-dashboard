"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileTextIcon, Trash2Icon } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { ReportView } from "@/components/reporting/ReportView";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { ROUTES } from "@/constants/routes";
import { useReport, useReportActions } from "@/hooks/useReporting";

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = use(params);
  const router = useRouter();
  const { data, isLoading, isError } = useReport(reportId);
  const { remove } = useReportActions();
  const [confirmDelete, setConfirmDelete] = useState(false);

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
          <Link href={ROUTES.reporting} className="text-sec font-medium text-ink-primary">
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
          <div className="flex items-center gap-3">
            <Link href={ROUTES.reporting} className="text-sec font-medium text-ink-primary">
              All reports
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2Icon />
              Delete report
            </Button>
          </div>
        }
      />
      <ReportView report={data} />
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this report?"
        description={`Report for ${data.month} will be permanently removed.`}
        confirmLabel="Delete"
        destructive
        loading={remove.isPending}
        onConfirm={() =>
          remove.mutate(data.id, {
            onSuccess: () => {
              setConfirmDelete(false);
              router.push(ROUTES.reporting);
            },
          })
        }
      />
    </>
  );
}
