"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

/** Persisted state backed by localStorage, SSR-safe (no setState-in-effect). */
export function useLocalStorage<T>(key: string, initial: T) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      window.addEventListener("storage", onChange);
      return () => window.removeEventListener("storage", onChange);
    },
    [],
  );

  const getSnapshot = useCallback(() => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }, [key]);

  // Server + first paint return null → falls back to `initial`.
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => null);

  const value = useMemo<T>(() => {
    if (raw == null) return initial;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return initial;
    }
  }, [raw, initial]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === "function" ? (next as (p: T) => T)(value) : next;
      try {
        window.localStorage.setItem(key, JSON.stringify(resolved));
        // Notify same-tab subscribers (native storage event is cross-tab only).
        window.dispatchEvent(new StorageEvent("storage", { key }));
      } catch {
        /* ignore */
      }
    },
    [key, value],
  );

  return [value, set] as const;
}
