"use client";

import { Button } from "@/components/ui/button";
import { IDENTITY_STATES, IDENTITY_STATE_LABEL } from "@/constants/shellContract";
import type { ThreadFilterState } from "@/types/thread";
import { cn } from "@/lib/utils";

/** The toggles from Surface 2 v5.0 §3.1, in the order an operator scans them. */
const TOGGLES: Array<{
  key: keyof Pick<
    ThreadFilterState,
    "liveOnly" | "blockedOnApproval" | "guardHalted" | "hasAttachments"
  >;
  label: string;
}> = [
  { key: "liveOnly", label: "Live now" },
  { key: "blockedOnApproval", label: "Blocked on approval" },
  { key: "guardHalted", label: "Guard halted" },
  { key: "hasAttachments", label: "Has attachments" },
];

export function ThreadFilters({
  filters,
  onChange,
}: {
  filters: ThreadFilterState;
  onChange: (next: ThreadFilterState) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Button
        size="sm"
        variant={filters.identity === "all" ? "default" : "outline"}
        onClick={() => onChange({ ...filters, identity: "all" })}
      >
        All planes
      </Button>
      {IDENTITY_STATES.map((identity) => (
        <Button
          key={identity}
          size="sm"
          variant={filters.identity === identity ? "default" : "outline"}
          onClick={() => onChange({ ...filters, identity })}
        >
          {IDENTITY_STATE_LABEL[identity]}
        </Button>
      ))}

      <span className="mx-1 h-5 w-px bg-border-soft" aria-hidden="true" />

      {TOGGLES.map(({ key, label }) => (
        <Button
          key={key}
          size="sm"
          variant={filters[key] ? "default" : "outline"}
          aria-pressed={filters[key]}
          onClick={() => onChange({ ...filters, [key]: !filters[key] })}
          className={cn(filters[key] && "font-semibold")}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
