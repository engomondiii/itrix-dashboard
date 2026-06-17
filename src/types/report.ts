export interface ReportSection {
  id: string;
  title: string;
  /** Plain-English narrative for the section. */
  body: string;
}

export interface MonthlyReport {
  id: string;
  month: string; // e.g. "2026-07"
  generatedAt: string; // ISO
  sections: ReportSection[];
}
