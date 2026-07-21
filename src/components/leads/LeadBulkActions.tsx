"use client";

import { Button } from "@/components/ui/button";
import { useLeadStore } from "@/store/leadStore";
import { useToast } from "@/hooks/useToast";

/** Bulk-action bar; appears when one or more rows are selected. */
export function LeadBulkActions() {
  const { selected, clear } = useLeadStore();
  const { toast } = useToast();
  const count = selected.size;
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-3 rounded-md border border-tint bg-soft px-3 py-2">
      <span className="text-sec font-medium text-ink-primary tabular-nums">
        {count} selected
      </span>
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.info("Bulk assign is wired in Phase 5")}
        >
          Assign owner
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.info("Bulk status is wired in Phase 5")}
        >
          Set status
        </Button>
        <Button variant="ghost" size="sm" onClick={clear}>
          Clear
        </Button>
      </div>
    </div>
  );
}
