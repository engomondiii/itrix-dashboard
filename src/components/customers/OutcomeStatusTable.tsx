import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/formatting";
import { OUTCOME_STATUS_INTENT, type Outcome } from "@/types/customer";

/**
 * The outcomes we agreed with this customer, and where each one stands.
 *
 * THESE ARE THE CUSTOMER'S OUTCOMES. Never an internal sales target, never a
 * pipeline stage, never a commercial probability (Playbook v1.6 §12B). The
 * status words are fixed vocabulary — "On plan · At risk · Off plan · Achieved"
 * — because they are customer-visible and paraphrasing "off plan" into
 * something softer would quietly retract a commitment.
 */
export function OutcomeStatusTable({ outcomes }: { outcomes: Outcome[] }) {
  if (outcomes.length === 0) {
    return <p className="text-sec text-ink-secondary">No agreed outcomes yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Outcome</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>What we measure</TableHead>
            <TableHead>Target</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {outcomes.map((o) => (
            <TableRow key={o.id}>
              <TableCell className="font-medium text-ink-primary">{o.title}</TableCell>
              <TableCell>
                <Badge variant={OUTCOME_STATUS_INTENT[o.status]}>{o.status}</Badge>
              </TableCell>
              <TableCell className="max-w-[34ch] text-sec text-ink-secondary">
                {o.measure}
              </TableCell>
              <TableCell className="text-sec text-ink-secondary">
                {o.targetDate ? formatDate(o.targetDate) : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
