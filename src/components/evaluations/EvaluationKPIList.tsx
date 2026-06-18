"use client";

import { useState } from "react";
import { PencilIcon } from "lucide-react";

import { EvaluationKpiDialog } from "@/components/evaluations/EvaluationKpiDialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { EvaluationKPI } from "@/types/evaluation";

export function EvaluationKPIList({
  evaluationId,
  kpis,
}: {
  evaluationId: string;
  kpis: EvaluationKPI[];
}) {
  const [editing, setEditing] = useState<EvaluationKPI | null>(null);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead>Metric</TableHead>
            <TableHead className="text-right">Target</TableHead>
            <TableHead className="text-right">Result</TableHead>
            <TableHead className="w-0" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {kpis.map((k) => (
            <TableRow key={k.id}>
              <TableCell className="text-ink-700">{k.category}</TableCell>
              <TableCell className="text-ink-500">{k.metric}</TableCell>
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
                  aria-label={`Edit ${k.category} KPI`}
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
        <EvaluationKpiDialog
          evaluationId={evaluationId}
          kpi={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
