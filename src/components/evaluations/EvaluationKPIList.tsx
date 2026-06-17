import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { EvaluationKPI } from "@/types/evaluation";

export function EvaluationKPIList({ kpis }: { kpis: EvaluationKPI[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Category</TableHead>
          <TableHead>Metric</TableHead>
          <TableHead className="text-right">Target</TableHead>
          <TableHead className="text-right">Result</TableHead>
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
