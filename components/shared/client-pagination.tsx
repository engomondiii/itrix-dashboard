'use client';

/**
 * Client-side pagination for lists the backend serves whole (evaluations,
 * pocs, customers, personas…): same affordances as the server-paginated
 * leads table — "Showing X–Y of Z", a 20/50/100 per-page picker, prev/next.
 */

import { useState } from 'react';

import { Button } from '@/components/ui/button';

const SIZES = [20, 50, 100] as const;

export function useClientPage<T>(rows: T[]) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const clamped = Math.min(page, totalPages);
  return {
    pageRows: rows.slice((clamped - 1) * pageSize, clamped * pageSize),
    page: clamped,
    pageSize,
    total: rows.length,
    totalPages,
    setPage,
    setPageSize: (n: number) => {
      setPageSize(n);
      setPage(1);
    },
  };
}

export function PaginationFooter({
  page,
  pageSize,
  total,
  totalPages,
  noun,
  onPage,
  onPageSize,
}: {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  noun: string;
  onPage: (page: number) => void;
  onPageSize: (n: number) => void;
}) {
  if (total === 0) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
      <span data-numeric>
        Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total} {noun}
      </span>
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1.5 text-xs">
          Per page
          <select
            value={pageSize}
            onChange={(e) => onPageSize(Number(e.target.value))}
            className="h-7 rounded-md border border-input bg-card px-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Previous
        </Button>
        <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
