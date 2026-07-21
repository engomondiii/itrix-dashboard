import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { FunnelStage } from "@/types/analytics";

export function ConversionRateTable({ stages }: { stages: FunnelStage[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Stage</TableHead>
          <TableHead className="text-right">Reached</TableHead>
          <TableHead className="text-right">Conversion</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stages.map((s) => (
          <TableRow key={s.stage}>
            <TableCell className="text-ink-secondary">{s.stage}</TableCell>
            <TableCell className="text-right tabular-nums text-ink-primary">{s.count}</TableCell>
            <TableCell className="text-right tabular-nums text-ink-secondary">
              {s.conversion != null ? `${Math.round(s.conversion * 100)}%` : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
