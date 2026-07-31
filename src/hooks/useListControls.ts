"use client";

import { useEffect, useMemo } from "react";

import { usePagination } from "@/hooks/usePagination";
import { useSearch } from "@/hooks/useSearch";
import { useTableSort, type SortState } from "@/hooks/useTableSort";

/** A sortable value. `null`/`undefined` always sort last, in either direction. */
export type SortValue = string | number | null | undefined;

export interface UseListControlsOptions<T, K extends string> {
  items: T[] | undefined;
  /**
   * The searchable text of one item, lowercased haystack. When omitted the
   * search box should not be rendered — searching would silently match nothing.
   */
  searchText?: (item: T) => string;
  /** Per-column accessors. Only columns listed here are sortable. */
  sortAccessors?: Record<K, (item: T) => SortValue>;
  initialSort?: Partial<SortState<K>>;
  /**
   * An externally-owned organization filter (family chips, status tabs…).
   * Kept outside this hook so the page owns its filter UI and state; passing
   * it here just makes it apply before search, sort and paging.
   */
  filter?: (item: T) => boolean;
  /**
   * A serializable fingerprint of the current filter selection ("all",
   * "portal"…). Page reset keys off this rather than the `filter` function,
   * whose identity changes every render when written inline.
   */
  filterKey?: string | number | null;
  pageSize?: number;
}

/**
 * Search + sort + pagination over a client-held list, in that order.
 *
 * The list endpoints on this surface return the full collection (the backend
 * does not page yet — BACKEND_GAPS), so a page that renders `data.map(...)`
 * unbounded degrades linearly with production volume. This hook is the one
 * composition of the three primitive hooks, so every registry/queue/browser
 * page organises bulk data the same way instead of growing its own variant.
 *
 * Page state resets to 1 whenever the query, filter result or sort changes —
 * staying on page 7 of a search that now has 2 pages shows silence instead of
 * matches.
 */
export function useListControls<T, K extends string>({
  items,
  searchText,
  sortAccessors,
  initialSort,
  filter,
  filterKey,
  pageSize,
}: UseListControlsOptions<T, K>) {
  const search = useSearch();
  const { sort, setSort, toggle: toggleSort } = useTableSort<K>(initialSort);

  const filtered = useMemo(() => {
    let list = items ?? [];
    if (filter) list = list.filter(filter);
    const q = search.debounced.trim().toLowerCase();
    if (q && searchText) {
      list = list.filter((item) => searchText(item).toLowerCase().includes(q));
    }
    return list;
  }, [items, filter, search.debounced, searchText]);

  const sorted = useMemo(() => {
    const accessor = sort.key ? sortAccessors?.[sort.key] : undefined;
    if (!accessor) return filtered;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") {
        return (av - bv) * dir;
      }
      return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir;
    });
  }, [filtered, sort, sortAccessors]);

  const pagination = usePagination({ total: sorted.length, pageSize });
  const { setPage } = pagination;

  useEffect(() => {
    setPage(1);
  }, [search.debounced, sort.key, sort.dir, filterKey, setPage]);

  const pageItems = useMemo(
    () => sorted.slice(pagination.range.start, pagination.range.end),
    [sorted, pagination.range.start, pagination.range.end],
  );

  return {
    /** Bind to `SearchInput`: `value={search.value}` / `onChange`. */
    search,
    sort,
    /** For card lists driving sort from a Select rather than column headers. */
    setSort,
    toggleSort,
    /** Rows for the current page, after filter → search → sort. */
    pageItems,
    /** Count after filter+search — the "N results" number, not the page size. */
    total: sorted.length,
    /** Count before any narrowing, for "showing X of Y" copy. */
    unfilteredTotal: items?.length ?? 0,
    pagination,
  };
}
