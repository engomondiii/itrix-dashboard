'use client';

/**
 * Debounce a fast-changing value (a search box) before it drives something
 * expensive (a server query, a URL write). The input stays instant; the
 * consumer sees the settled value.
 */

import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}
