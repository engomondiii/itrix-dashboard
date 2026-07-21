"use client";

import { cn } from "@/lib/utils";

const OPTIONS = [
  { days: 7, label: "7d" },
  { days: 30, label: "30d" },
  { days: 90, label: "90d" },
] as const;

/** Preset date-range selector for analytics views. */
export function DateRangeControl({
  value,
  onChange,
}: {
  value: number;
  onChange: (days: number) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Date range"
      className="inline-flex rounded-lg border border-border-soft bg-surface p-0.5"
    >
      {OPTIONS.map((o) => (
        <button
          key={o.days}
          type="button"
          aria-pressed={value === o.days}
          onClick={() => onChange(o.days)}
          className={cn(
            "rounded-md px-2.5 py-1 text-caption font-medium transition-colors",
            value === o.days
              ? "bg-ink-primary text-white"
              : "text-ink-secondary hover:text-ink-primary",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
