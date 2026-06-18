"use client";

import { useState } from "react";
import { PencilIcon } from "lucide-react";

import { PoCKpiDialog } from "@/components/pocs/PoCKpiDialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PoCKPI } from "@/types/poc";

export function PoCKPIDisplay({
  pocId,
  kpis,
}: {
  pocId: string;
  kpis: PoCKPI[];
}) {
  const [editing, setEditing] = useState<PoCKPI | null>(null);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Metric</TableHead>
            <TableHead className="text-right">Baseline</TableHead>
            <TableHead className="text-right">Target</TableHead>
            <TableHead className="text-right">Result</TableHead>
            <TableHead className="w-0" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {kpis.map((k) => (
            <TableRow key={k.id}>
              <TableCell className="text-ink-700">
                {k.metric}
                <span className="ml-1 text-caption text-ink-400">({k.category})</span>
              </TableCell>
              <TableCell className="text-right text-ink-500">{k.baseline ?? "—"}</TableCell>
              <TableCell className="text-right tabular-nums text-ink-700">
                {k.target ?? "—"}
              </TableCell>
              <TableCell className="text-right tabular-nums font-medium text-ink-900">
                {k.result ?? "—"}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Edit ${k.metric} KPI`}
                  onClick={() => setEditing(k)}
                >
                  <PencilIcon className="text-ink-400" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editing && (
        <PoCKpiDialog
          pocId={pocId}
          kpi={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
