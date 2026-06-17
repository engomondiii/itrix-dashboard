"use client";

import { DownloadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/formatting";
import type { MonthlyReport } from "@/types/report";

function toMarkdown(report: MonthlyReport): string {
  const head = `# itriX Operations — ${report.month}\n\n_Generated ${formatDate(report.generatedAt)}_\n`;
  const body = report.sections
    .map((s) => `\n## ${s.title}\n\n${s.body}\n`)
    .join("");
  return head + body;
}

export function ReportView({ report }: { report: MonthlyReport }) {
  function exportMd() {
    const blob = new Blob([toMarkdown(report)], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `itrix-report-${report.month}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={exportMd}>
          <DownloadIcon />
          Export (.md)
        </Button>
      </div>
      {report.sections.map((s) => (
        <Card key={s.id}>
          <CardHeader>
            <CardTitle>{s.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-body text-ink-700">{s.body}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
