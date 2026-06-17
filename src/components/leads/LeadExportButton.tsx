"use client";

import { DownloadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toCSV, downloadCSV } from "@/lib/export/exportCSV";
import { formatDate } from "@/lib/formatting";
import type { LeadListItem } from "@/types/lead";

export function LeadExportButton({ rows }: { rows: LeadListItem[] }) {
  function onExport() {
    const csv = toCSV(
      rows.map((r) => ({ ...r, submittedAt: formatDate(r.submittedAt) })),
      [
        { key: "company", header: "Company" },
        { key: "visitorName", header: "Contact" },
        { key: "industry", header: "Industry" },
        { key: "productRoute", header: "Route" },
        { key: "commercialPath", header: "License path" },
        { key: "primaryPain", header: "Primary pain" },
        { key: "tier", header: "Tier" },
        { key: "score", header: "Score" },
        { key: "status", header: "Status" },
        { key: "owner", header: "Owner" },
        { key: "submittedAt", header: "Submitted" },
      ],
    );
    downloadCSV(`itrix-leads-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  return (
    <Button variant="outline" size="sm" onClick={onExport} disabled={!rows.length}>
      <DownloadIcon />
      Export
    </Button>
  );
}
