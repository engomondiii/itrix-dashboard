"use client";

import { useMemo, useState } from "react";

import { dashboardConfig } from "@/config/dashboard.config";

export interface UsePaginationOptions {
  total: number;
  pageSize?: number;
  initialPage?: number;
}

/** Page state + derived bounds for tables. */
export function usePagination({
  total,
  pageSize = dashboardConfig.pageSize,
  initialPage = 1,
}: UsePaginationOptions) {
  const [page, setPage] = useState(initialPage);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);

  const range = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return { start, end: Math.min(start + pageSize, total) };
  }, [safePage, pageSize, total]);

  return {
    page: safePage,
    pageSize,
    pageCount,
    range,
    setPage,
    next: () => setPage((p) => Math.min(p + 1, pageCount)),
    prev: () => setPage((p) => Math.max(p - 1, 1)),
  };
}
