"use client";

import { useState } from "react";
import {
  DownloadIcon,
  MoreVerticalIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";

import { ReportSectionDialog } from "@/components/reporting/ReportSectionDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadReport, REPORT_FORMATS } from "@/lib/export/report";
import { useReportActions } from "@/hooks/useReporting";
import type { MonthlyReport, ReportSection } from "@/types/report";

export function ReportView({ report }: { report: MonthlyReport }) {
  const { removeSection } = useReportActions();
  const [adding, setAdding] = useState(false);
  const [editingSection, setEditingSection] = useState<ReportSection | null>(null);
  const [confirming, setConfirming] = useState<ReportSection | null>(null);

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
          <PlusIcon />
          Add section
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
            <DownloadIcon />
            Export
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {REPORT_FORMATS.map((f) => (
              <DropdownMenuItem
                key={f.value}
                onClick={() => downloadReport(report, f.value)}
              >
                {f.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {report.sections.map((s) => (
        <Card key={s.id}>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>{s.title}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Section actions"
                  className="inline-flex size-7 items-center justify-center rounded-md text-ink-400 outline-none hover:bg-muted hover:text-ink-700 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <MoreVerticalIcon className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditingSection(s)}>
                    <PencilIcon />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setConfirming(s)}
                  >
                    <Trash2Icon />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-body whitespace-pre-wrap text-ink-700">{s.body}</p>
          </CardContent>
        </Card>
      ))}

      {adding && (
        <ReportSectionDialog reportId={report.id} onClose={() => setAdding(false)} />
      )}
      {editingSection && (
        <ReportSectionDialog
          reportId={report.id}
          section={editingSection}
          onClose={() => setEditingSection(null)}
        />
      )}
      <ConfirmDialog
        open={!!confirming}
        onOpenChange={(o) => {
          if (!o) setConfirming(null);
        }}
        title="Remove section?"
        description={
          confirming ? `“${confirming.title}” will be removed from this report.` : ""
        }
        confirmLabel="Remove"
        destructive
        loading={removeSection.isPending}
        onConfirm={() => {
          if (!confirming) return;
          removeSection.mutate(
            { reportId: report.id, sectionId: confirming.id },
            { onSuccess: () => setConfirming(null) },
          );
        }}
      />
    </div>
  );
}
