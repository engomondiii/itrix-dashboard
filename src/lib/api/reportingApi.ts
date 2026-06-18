import { apiGet, apiSend } from "@/lib/api/client";
import { API } from "@/constants/routes";
import type { MonthlyReport } from "@/types/report";

export interface SectionInput {
  title: string;
  body: string;
}

export function listReports() {
  return apiGet<{ results: MonthlyReport[]; count: number }>(API.reporting);
}

export function getReport(id: string) {
  return apiGet<MonthlyReport>(API.report(id));
}

export function generateReport(month?: string) {
  return apiSend<MonthlyReport>(API.reporting, "POST", month ? { month } : {});
}

export function deleteReport(id: string) {
  return apiSend<{ ok: true }>(API.report(id), "DELETE");
}

export function addReportSection(reportId: string, input: SectionInput) {
  return apiSend<MonthlyReport>(API.reportSections(reportId), "POST", input);
}

export function updateReportSection(
  reportId: string,
  sectionId: string,
  patch: Partial<SectionInput>,
) {
  return apiSend<MonthlyReport>(
    API.reportSection(reportId, sectionId),
    "PATCH",
    patch,
  );
}

export function removeReportSection(reportId: string, sectionId: string) {
  return apiSend<MonthlyReport>(
    API.reportSection(reportId, sectionId),
    "DELETE",
  );
}
