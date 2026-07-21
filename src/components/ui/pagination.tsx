"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  page: number; // 1-based
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Total item count, for the "X–Y of N" summary. */
  total?: number;
  pageSize?: number;
  className?: string;
}

/** Compact prev/next pager with a range summary. */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  total,
  pageSize,
  className,
}: PaginationProps) {
  const canPrev = page > 1;
  const canNext = page < pageCount;

  const summary =
    total != null && pageSize != null
      ? `${Math.min((page - 1) * pageSize + 1, total)}–${Math.min(page * pageSize, total)} of ${total}`
      : `Page ${page} of ${Math.max(pageCount, 1)}`;

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <span className="text-caption tabular-nums text-ink-secondary">{summary}</span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          disabled={!canPrev}
          onClick={() => canPrev && onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeftIcon />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={!canNext}
          onClick={() => canNext && onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
}
