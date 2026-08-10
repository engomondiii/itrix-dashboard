'use client';

/**
 * Light / dark theme.
 *
 * The hard part is not storing the preference — it is that the browser paints
 * the page before React hydrates. Read the stored theme in a `useEffect` and
 * a user with dark mode selected gets a white flash on every navigation.
 * `app/layout.tsx` therefore runs a tiny blocking script (`THEME_INIT_SCRIPT`
 * below) in `<head>` that sets the class before first paint; this provider
 * only keeps React's state in sync with what that script already did.
 *
 * `suppressHydrationWarning` on `<html>` is required, and is not a
 * workaround: the script deliberately mutates the element between the server
 * render and hydration, so React's mismatch warning is a false positive here.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';

/** Viewport coordinates the theme reveal should expand from. */
export interface ThemeOrigin {
  x: number;
  y: number;
}

interface ThemeContextValue {
  theme: Theme;
  /** What is actually applied once `system` is resolved. */
  resolvedTheme: 'light' | 'dark';
  /** Pass the triggering click's coordinates to animate the switch. */
  setTheme: (theme: Theme, origin?: ThemeOrigin) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Inlined in <head> by the root layout. Keep it small and dependency-free —
 * it blocks the first paint, which is exactly why it prevents the flash.
 */
export const THEME_INIT_SCRIPT = `
(function() {
  try {
    var stored = localStorage.getItem('${STORAGE_KEY}');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : (prefersDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
  } catch (e) {}
})();
`.trim();

function systemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(resolved: 'light' | 'dark') {
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  // Tells the browser to render native form controls and scrollbars to match.
  root.style.colorScheme = resolved;
}

/**
 * Circle-reveal theme switch (harvested from the source project's
 * View-Transitions toggle, reworked to expand from the actual click point
 * rather than a fixed corner, and to skip cleanly when the API is missing
 * or the user prefers reduced motion).
 *
 * `apply` MUST mutate the DOM synchronously — `startViewTransition`
 * snapshots the page, runs the callback, snapshots again, and animates
 * between the two. The classList flip in `applyTheme` is synchronous, which
 * is what makes this work; React's own state update can lag behind harmlessly
 * because it only changes labels, not colours.
 *
 * The default cross-fade is suppressed in globals.css so the scripted circle
 * is the only animation.
 */
function withThemeTransition(apply: () => void, origin?: ThemeOrigin): void {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduceMotion) {
    apply();
    return;
  }

  const transition = document.startViewTransition(apply);
  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? window.innerHeight / 2;
  // Radius to the farthest viewport corner, so the circle always covers it.
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

  transition.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 400, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' },
      );
    })
    .catch(() => {
      // `ready` rejects if the transition is skipped (rapid toggling); the
      // theme has still been applied, so there is nothing to recover.
    });
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // 'system' as the initial value so the server render and the first client
  // render agree. The blocking script has already applied the real theme to
  // the DOM; the effect below reconciles state without touching the class.
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    const initial: Theme = stored ?? 'system';
    // Deliberate setState-in-effect: this is the one-time client hydration of
    // state the server cannot know (localStorage). Initialising the state from
    // storage instead would make the first client render disagree with SSR —
    // a hydration error, traded for one extra render here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(initial);
    setResolvedTheme(initial === 'system' ? systemTheme() : initial);
  }, []);

  // Follow the OS preference live while the user is on 'system'. Without
  // this, switching the OS to dark mode does nothing until a reload.
  useEffect(() => {
    if (theme !== 'system') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const resolved = media.matches ? 'dark' : 'light';
      setResolvedTheme(resolved);
      applyTheme(resolved);
    };

    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [theme]);

  const setTheme = useCallback((next: Theme, origin?: ThemeOrigin) => {
    const resolved = next === 'system' ? systemTheme() : next;

    withThemeTransition(() => {
      setThemeState(next);
      setResolvedTheme(resolved);
      applyTheme(resolved);
    }, origin);

    try {
      if (next === 'system') {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        window.localStorage.setItem(STORAGE_KEY, next);
      }
    } catch {
      // Private browsing or a storage policy. The theme still applies for
      // this session; it just will not persist.
    }
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside <ThemeProvider>');
  return context;
}
