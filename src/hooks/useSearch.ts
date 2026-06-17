"use client";

import { useEffect, useState } from "react";

/** Controlled search input value + a debounced copy for querying. */
export function useSearch(initial = "", delay = 300) {
  const [value, setValue] = useState(initial);
  const [debounced, setDebounced] = useState(initial);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return { value, setValue, debounced };
}
