import { formatDate } from "@/lib/formatting";
import type { MonthlyReport } from "@/types/report";

export type ReportFormat = "md" | "csv" | "json" | "html";

export const REPORT_FORMATS: { value: ReportFormat; label: string }[] = [
  { value: "md", label: "Markdown (.md)" },
  { value: "csv", label: "CSV (.csv)" },
  { value: "json", label: "JSON (.json)" },
  { value: "html", label: "HTML (.html)" },
];

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function toMarkdown(report: MonthlyReport): string {
  const head = `# itriX Operations — ${report.month}\n\n_Generated ${formatDate(report.generatedAt)}_\n`;
  const body = report.sections
    .map((s) => `\n## ${s.title}\n\n${s.body}\n`)
    .join("");
  return head + body;
}

export function toCsv(report: MonthlyReport): string {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const rows = [
    ["Section", "Body"],
    ...report.sections.map((s) => [s.title, s.body]),
  ];
  return rows.map((r) => r.map(esc).join(",")).join("\r\n");
}

export function toJson(report: MonthlyReport): string {
  return JSON.stringify(report, null, 2);
}

export function toHtml(report: MonthlyReport): string {
  const sections = report.sections
    .map(
      (s) =>
        `  <section>\n    <h2>${escapeHtml(s.title)}</h2>\n    <p>${escapeHtml(
          s.body,
        ).replace(/\n/g, "<br>")}</p>\n  </section>`,
    )
    .join("\n");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>itriX Operations — ${escapeHtml(report.month)}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 720px; margin: 2rem auto; color: #1f2433; padding: 0 1rem; }
    h1 { font-size: 20px; } h2 { font-size: 16px; margin-bottom: .25rem; }
    section { margin: 1.25rem 0; } em { color: #6b7186; }
  </style>
</head>
<body>
  <h1>itriX Operations — ${escapeHtml(report.month)}</h1>
  <p><em>Generated ${escapeHtml(formatDate(report.generatedAt))}</em></p>
${sections}
</body>
</html>`;
}

const RENDERERS: Record<
  ReportFormat,
  { ext: string; mime: string; render: (r: MonthlyReport) => string }
> = {
  md: { ext: "md", mime: "text/markdown", render: toMarkdown },
  csv: { ext: "csv", mime: "text/csv", render: toCsv },
  json: { ext: "json", mime: "application/json", render: toJson },
  html: { ext: "html", mime: "text/html", render: toHtml },
};

/** Serialise a report and trigger a browser download (client-only). */
export function downloadReport(report: MonthlyReport, format: ReportFormat) {
  const { ext, mime, render } = RENDERERS[format];
  const blob = new Blob([render(report)], { type: `${mime};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `itrix-report-${report.month}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}
