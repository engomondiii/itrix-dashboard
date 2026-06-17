import { cn } from "@/lib/utils";

export interface DataCardProps {
  label: string;
  value: React.ReactNode;
  /** Optional delta indicator shown beside the value. */
  delta?: { label: string; direction: "up" | "down" | "neutral" };
  hint?: string;
  className?: string;
  valueClassName?: string;
}

const DELTA_COLOR: Record<NonNullable<DataCardProps["delta"]>["direction"], string> = {
  up: "text-success",
  down: "text-error",
  neutral: "text-ink-400",
};

/** Compact KPI card — micro label + large tabular numeral. The value is the
 *  only element allowed to be large (Atelier type discipline). */
export function DataCard({
  label,
  value,
  delta,
  hint,
  className,
  valueClassName,
}: DataCardProps) {
  return (
    <div className={cn("rounded-md border border-line bg-surface p-4 shadow-1", className)}>
      <div className="text-micro font-semibold uppercase tracking-[0.06em] text-ink-400">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span
          className={cn(
            "text-kpi font-semibold tabular-nums text-ink-900",
            valueClassName,
          )}
        >
          {value}
        </span>
        {delta && (
          <span className={cn("text-caption font-medium", DELTA_COLOR[delta.direction])}>
            {delta.label}
          </span>
        )}
      </div>
      {hint && <div className="mt-1 text-caption text-ink-400">{hint}</div>}
    </div>
  );
}
