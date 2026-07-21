import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DIMENSION_LABEL } from "@/constants/listeningDimensions";
import { formatDateTime } from "@/lib/formatting";
import type { QuestionHistoryEntry } from "@/types/thread";

/**
 * What the loop asked, and whether it worked.
 *
 * Every generated question is logged against the dimension it was trying to
 * cover (Backend v6.0 §5.4), which is what makes an unproductive loop visible
 * instead of mysterious: three questions asked and the same three dimensions
 * still unknown is a question-bank problem, not bad luck. A run of
 * unproductive rows against one dimension is the signal worth acting on.
 */
export function QuestionHistoryTable({ entries }: { entries: QuestionHistoryEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="text-sec text-ink-secondary">
        No generated questions yet — the visitor has not been asked anything.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Question</TableHead>
            <TableHead>Targeted</TableHead>
            <TableHead>Outcome</TableHead>
            <TableHead>Asked</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((q) => (
            <TableRow key={q.id}>
              <TableCell className="max-w-[42ch] text-sec text-ink-primary">
                {q.primaryText}
              </TableCell>
              <TableCell className="text-sec text-ink-secondary">
                {DIMENSION_LABEL[q.targetDimension]}
              </TableCell>
              <TableCell>
                {q.productive ? (
                  <Badge variant="success">Moved the dimension</Badge>
                ) : (
                  <Badge variant="warning">No movement</Badge>
                )}
              </TableCell>
              <TableCell className="text-micro text-ink-secondary">
                {formatDateTime(q.askedAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
