"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addReportSection,
  deleteReport,
  generateReport,
  getReport,
  listReports,
  removeReportSection,
  updateReportSection,
  type SectionInput,
} from "@/lib/api/reportingApi";
import { useToast } from "@/hooks/useToast";
import type { MonthlyReport } from "@/types/report";

export function useReports() {
  return useQuery({ queryKey: ["reports"], queryFn: listReports });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: ["report", id],
    queryFn: () => getReport(id),
    enabled: Boolean(id),
  });
}

/** Generate / delete reports and edit their sections. */
export function useReportActions() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["reports"] });
  const onError = (e: unknown) => toast.error((e as Error).message);
  const writeReport = (r: MonthlyReport) => {
    qc.setQueryData(["report", r.id], r);
    invalidate();
  };

  return {
    generate: useMutation({
      mutationFn: (month?: string) => generateReport(month),
      onSuccess: (r) => {
        writeReport(r);
        toast.success("Report generated");
      },
      onError,
    }),
    remove: useMutation({
      mutationFn: (id: string) => deleteReport(id),
      onSuccess: () => {
        invalidate();
        toast.success("Report deleted");
      },
      onError,
    }),
    addSection: useMutation({
      mutationFn: (vars: { reportId: string; input: SectionInput }) =>
        addReportSection(vars.reportId, vars.input),
      onSuccess: (r) => {
        writeReport(r);
        toast.success("Section added");
      },
      onError,
    }),
    updateSection: useMutation({
      mutationFn: (vars: {
        reportId: string;
        sectionId: string;
        patch: Partial<SectionInput>;
      }) => updateReportSection(vars.reportId, vars.sectionId, vars.patch),
      onSuccess: (r) => {
        writeReport(r);
        toast.success("Section updated");
      },
      onError,
    }),
    removeSection: useMutation({
      mutationFn: (vars: { reportId: string; sectionId: string }) =>
        removeReportSection(vars.reportId, vars.sectionId),
      onSuccess: (r) => {
        writeReport(r);
        toast.success("Section removed");
      },
      onError,
    }),
  };
}
