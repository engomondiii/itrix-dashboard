"use client";

import Link from "next/link";
import { FileTextIcon, PlusIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { ROUTES } from "@/constants/routes";
import { formatDate } from "@/lib/formatting";
import { useReportActions, useReports } from "@/hooks/useReporting";

export default function ReportingPage() {
  const { data, isLoading } = useReports();
  const { generate } = useReportActions();
  const reports = data?.results ?? [];

  return (
    <>
      <PageHeader
        title="Reporting"
        description="Monthly performance reports."
        actions={
          <Button
            onClick={() => generate.mutate(undefined)}
            disabled={generate.isPending}
          >
            <PlusIcon />
            {generate.isPending ? "Generating…" : "Generate report"}
          </Button>
        }
      />
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="size-5" />
        </div>
      ) : reports.length === 0 ? (
        <EmptyState icon={FileTextIcon} title="No reports yet" />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((r) => (
            <Link
              key={r.id}
              href={ROUTES.report(r.id)}
              className="rounded-md border border-line bg-surface p-4 shadow-1 transition-colors hover:border-sapphire-300"
            >
              <div className="flex items-center gap-2 text-card-title font-semibold text-ink-900">
                <FileTextIcon className="size-4 text-ink-400" />
                {r.month}
              </div>
              <div className="mt-1 text-caption text-ink-400">
                {r.sections.length} sections · generated {formatDate(r.generatedAt)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
