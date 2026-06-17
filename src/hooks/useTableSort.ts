"use client";

import { useCallback, useState } from "react";

import type { SortDir } from "@/types/api";

export interface SortState<K extends string> {
  key: K | null;
  dir: SortDir;
}

/** Column sort state with toggle (asc → desc → asc) semantics. */
export function useTableSort<K extends string>(
  initial?: Partial<SortState<K>>,
) {
  const [sort, setSort] = useState<SortState<K>>({
    key: initial?.key ?? null,
    dir: initial?.dir ?? "asc",
  });

  const toggle = useCallback((key: K) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  }, []);

  return { sort, setSort, toggle };
}
