"use client";

import { ChevronDownIcon, ChevronUpIcon, ChevronsUpDownIcon } from "lucide-react";

import { TableHead } from "@/components/ui/table";
import { useFilterStore } from "@/store/filterStore";
import { cn } from "@/lib/utils";

/** A sortable table header cell wired to the filter store's sort/dir. */
export function SortableHeader({
  sortKey,
  children,
  className,
}: {
  sortKey: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { sort, dir, toggleSort } = useFilterStore();
  const activeSort = sort === sortKey;
  const Icon = !activeSort ? ChevronsUpDownIcon : dir === "asc" ? ChevronUpIcon : ChevronDownIcon;

  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => toggleSort(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 transition-colors hover:text-ink-900",
          activeSort ? "text-ink-900" : "text-ink-700",
        )}
      >
        {children}
        <Icon className={cn("size-3.5", activeSort ? "text-sapphire-600" : "text-ink-400")} />
      </button>
    </TableHead>
  );
}
