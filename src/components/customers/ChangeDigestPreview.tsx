import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatting";
import type { ChangeLogEntry } from "@/types/customer";

const KIND_LABEL: Record<ChangeLogEntry["kind"], string> = {
  completed: "Completed",
  resolved: "Resolved",
  shipped: "Shipped",
  awaiting_decision: "Waiting on you",
};

const KIND_INTENT: Record<
  ChangeLogEntry["kind"],
  "success" | "info" | "neutral" | "warning"
> = {
  completed: "success",
  resolved: "success",
  shipped: "info",
  awaiting_decision: "warning",
};

/**
 * "What changed since you were last here", as the customer will see it.
 *
 * A PREVIEW OF CUSTOMER-FACING COPY, which is why it includes the awkward rows:
 * work we completed, issues we resolved, updates we shipped, AND anything
 * waiting on a decision from them (Playbook v1.6 §12E). A digest that only
 * listed our wins would read as marketing; the items waiting on the customer
 * are the ones that make it useful to them.
 */
export function ChangeDigestPreview({ changes }: { changes: ChangeLogEntry[] }) {
  if (changes.length === 0) {
    return (
      <p className="text-sec text-ink-secondary">Nothing has changed since their last visit.</p>
    );
  }

  return (
    <ul className="space-y-2">
      {changes.map((change) => (
        <li key={change.id} className="flex items-start justify-between gap-3">
          <span className="min-w-0">
            <Badge variant={KIND_INTENT[change.kind]}>{KIND_LABEL[change.kind]}</Badge>
            <span className="ml-1.5 text-sec text-ink-primary">{change.summary}</span>
          </span>
          <span className="shrink-0 text-micro text-ink-secondary">
            {formatDate(change.at)}
          </span>
        </li>
      ))}
    </ul>
  );
}
