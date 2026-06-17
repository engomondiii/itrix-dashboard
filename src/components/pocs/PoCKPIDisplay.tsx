import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PoCKPI } from "@/types/poc";

export function PoCKPIDisplay({ kpis }: { kpis: PoCKPI[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Metric</TableHead>
          <TableHead className="text-right">Baseline</TableHead>
          <TableHead className="text-right">Target</TableHead>
          <TableHead className="text-right">Result</TableHead>
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
