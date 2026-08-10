'use client';

/**
 * Light / dark / system switch.
 *
 * The theme layer already existed — tokens for both schemes, a provider, and
 * a blocking script that applies the stored choice before first paint — but
 * nothing in the product ever called `setTheme`, so a user was stuck with
 * whatever their OS said. This is that missing control.
 *
 * Three states, not two. A plain light/dark toggle has no way back to
 * "follow the system", and the moment someone taps it once they are opted
 * out of their OS preference forever. Cycling through all three keeps that
 * exit available without a menu.
 *
 * `suppressHydrationWarning` and a mounted guard are deliberate: the server
 * cannot know the stored preference, so the label is rendered only after the
 * provider has read localStorage. Rendering it during SSR would either
 * mismatch or flash the wrong icon.
 */

import { useSyncExternalStore } from 'react';

import { useTheme, type Theme } from './theme-provider';

/**
 * Hydration gate without a setState-in-effect: the store never changes, so
 * this returns `false` for the server snapshot and `true` on the client —
 * exactly one re-render after hydration, which is all `mounted` ever was.
 */
const noopSubscribe = () => () => {};
function useMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

const ORDER: Theme[] = ['light', 'dark', 'system'];

const LABEL: Record<Theme, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

/** Simple glyphs — no icon dependency for three states. */
const GLYPH: Record<Theme, string> = {
  light: '☀',
  dark: '☾',
  system: '◐',
};

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];

  return (
    <button
      type="button"
      onClick={(event) => {
        // Keyboard activation reports (0,0); expand from the button instead.
        const rect = event.currentTarget.getBoundingClientRect();
        const origin =
          event.clientX || event.clientY
            ? { x: event.clientX, y: event.clientY }
            : { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        setTheme(next, origin);
      }}
      // The accessible name states the current theme AND what the press will
      // do — "Theme: dark" alone leaves a screen-reader user guessing.
      aria-label={mounted ? `Theme: ${LABEL[theme]}. Switch to ${LABEL[next]}.` : 'Theme'}
      title={mounted ? `Theme: ${LABEL[theme]} — switch to ${LABEL[next]}` : 'Theme'}
      className={[
        'inline-flex h-7 min-w-7 items-center justify-center gap-1.5 rounded-md',
        'px-2 text-xs font-medium',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background',
        className,
      ].join(' ')}
    >
      <span aria-hidden="true" suppressHydrationWarning>
        {mounted ? GLYPH[theme] : GLYPH.system}
      </span>
      <span className="hidden sm:inline" suppressHydrationWarning>
        {mounted ? LABEL[theme] : ''}
      </span>
    </button>
  );
}

export default ThemeToggle;
