'use client';

/**
 * A string preference persisted in localStorage, read via
 * useSyncExternalStore so it is hydration-safe (the server snapshot is the
 * fallback; React re-renders with the stored value after hydration) and
 * stays in sync across tabs and same-tab writers for free.
 */

import { useCallback, useSyncExternalStore } from 'react';

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

export function useStoredState(key: string, fallback: string): [string, (next: string) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return window.localStorage.getItem(key) ?? fallback;
      } catch {
        return fallback;
      }
    },
    () => fallback,
  );

  const set = useCallback(
    (next: string) => {
      try {
        window.localStorage.setItem(key, next);
      } catch {
        /* storage blocked — the emit still updates this tab's UI */
      }
      emit();
    },
    [key],
  );

  return [value, set];
}
