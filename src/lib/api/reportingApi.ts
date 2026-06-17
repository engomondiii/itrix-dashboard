import { apiGet } from "@/lib/api/client";
import { API } from "@/constants/routes";
import type { MonthlyReport } from "@/types/report";

export function listReports() {
  return apiGet<{ results: MonthlyReport[]; count: number }>(API.reporting);
}

export function getReport(id: string) {
  return apiGet<MonthlyReport>(API.report(id));
}
