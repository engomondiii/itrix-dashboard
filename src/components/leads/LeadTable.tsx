"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SortableHeader } from "@/components/leads/LeadSortControls";
import { LeadTableRow } from "@/components/leads/LeadTableRow";
import { useLeadStore } from "@/store/leadStore";
import { cn } from "@/lib/utils";
import type { LeadListItem } from "@/types/lead";

export function LeadTable({
  rows,
  loading,
}: {
  rows: LeadListItem[];
  loading?: boolean;
}) {
  const { selected, toggle, setMany } = useLeadStore();
  const allOnPage = rows.length > 0 && rows.every((r) => selected.has(r.id));

  return (
    <div className="overflow-x-auto rounded-md border border-line bg-surface">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allOnPage}
                onCheckedChange={(v) => setMany(rows.map((r) => r.id), !!v)}
                aria-label="Select all on page"
              />
            </TableHead>
            <SortableHeader sortKey="company">Lead</SortableHeader>
            <TableHead>Industry</TableHead>
            <SortableHeader sortKey="productRoute">Route</SortableHeader>
            <TableHead>Pain</TableHead>
            <SortableHeader sortKey="tier">Tier</SortableHeader>
            <SortableHeader sortKey="score" className="text-right">
              Score
            </SortableHeader>
            <SortableHeader sortKey="status">Status</SortableHeader>
            <TableHead>Owner</TableHead>
            <SortableHeader sortKey="submittedAt" className="text-right">
              Submitted
            </SortableHeader>
          </TableRow>
        </TableHeader>
        <TableBody className={cn(loading && "opacity-60")}>
          {rows.map((r) => (
            <LeadTableRow
              key={r.id}
              lead={r}
              selected={selected.has(r.id)}
              onToggle={() => toggle(r.id)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
