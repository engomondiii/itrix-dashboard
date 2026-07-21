import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/** Centered empty state for tables, queues, and lists. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border-soft bg-surface px-6 py-12 text-center",
        className,
      )}
    >
      {Icon && <Icon className="size-6 text-ink-muted" />}
      <p className="text-card-title font-semibold text-ink-secondary">{title}</p>
      {description && (
        <p className="max-w-sm text-sec text-ink-secondary">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
