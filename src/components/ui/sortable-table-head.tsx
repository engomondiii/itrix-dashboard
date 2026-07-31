"use client";

import { ArrowDownIcon, ArrowUpIcon, ArrowUpDownIcon } from "lucide-react";

import { TableHead } from "@/components/ui/table";
import type { SortState } from "@/hooks/useTableSort";
import { cn } from "@/lib/utils";

export interface SortableTableHeadProps<K extends string>
  extends Omit<React.ComponentProps<typeof TableHead>, "onClick" | "onToggle"> {
  sortKey: K;
  sort: SortState<K>;
  onToggle: (key: K) => void;
}

/**
 * A column header that drives `useTableSort`/`useListControls`. The whole
 * header is the click target, and `aria-sort` carries the state for readers.
 */
export function SortableTableHead<K extends string>({
  sortKey,
  sort,
  onToggle,
  className,
  children,
  ...props
}: SortableTableHeadProps<K>) {
  const active = sort.key === sortKey;
  const Icon = active ? (sort.dir === "asc" ? ArrowUpIcon : ArrowDownIcon) : ArrowUpDownIcon;

  return (
    <TableHead
      aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
      className={cn("p-0", className)}
      {...props}
    >
      <button
        type="button"
        onClick={() => onToggle(sortKey)}
        className={cn(
          "flex h-10 w-full items-center gap-1 px-2 text-left font-medium",
          "transition-colors hover:text-ink-primary",
          active ? "text-ink-primary" : "text-inherit",
        )}
      >
        {children}
        <Icon className={cn("size-3.5 shrink-0", active ? "opacity-100" : "opacity-40")} />
      </button>
    </TableHead>
  );
}
