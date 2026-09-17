'use client';

/**
 * Language selection.
 *
 * The shape is deliberately the same as `components/theme-provider.tsx` —
 * a context, a hook, and a setter that writes the preference where it will
 * be found again — but the mechanics differ in one important way.
 *
 * The theme has to be applied by a blocking script before first paint,
 * because the theme lives in localStorage and the server cannot know it.
 * The locale does not need that trick: it lives in a cookie, so
 * `app/layout.tsx` reads it on the server and passes it in as
 * `initialLocale`. The first HTML the browser receives is therefore already
 * in the right language, with the right `lang` attribute — no flash, no
 * `suppressHydrationWarning`, and no setState-in-effect to reconcile.
 *
 * Copy is read as a plain object (`copy.nav.today`), not through a
 * `t('nav.today')` lookup. A typo in a dotted string key is a runtime
 * `undefined`; a typo in a property access does not compile.
 */

import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  type Locale,
} from './config';
import { MESSAGES, type Messages } from './messages';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  copy: Messages;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

function persist(locale: Locale): void {
  // `SameSite=Lax` is right for a preference: it still travels on top-level
  // navigations, so a bookmarked deep link renders in the chosen language.
  // No `Secure` flag — it would stop the cookie working on http://localhost
  // in development, and this value is a language name, not a credential.
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;

      setLocaleState(next);
      persist(next);

      // Client components re-render from the state above. Server-rendered
      // segments do not: their RSC payload is already in the router cache and
      // was built from the OLD cookie. `refresh()` refetches it with the new
      // one. Without this, anything rendered on the server — the `lang`
      // attribute, not-found.tsx — stays in the previous language until a
      // hard reload.
      router.refresh();

      // Kept in step for `:lang(ko)` CSS, which is what releases the negative
      // heading tracking and switches line-breaking to keep-all. The server
      // sets this correctly on load; this covers the switch itself, ahead of
      // the refresh landing.
      document.documentElement.lang = next;
    },
    [locale, router],
  );

  const value = useMemo(
    () => ({ locale, setLocale, copy: MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE] }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

function useLocaleContext(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used inside <LocaleProvider>');
  return context;
}

/** The active locale and the setter. For the switcher and for formatting. */
export function useLocale(): Omit<LocaleContextValue, 'copy'> {
  const { locale, setLocale } = useLocaleContext();
  return { locale, setLocale };
}

/**
 * The copy catalogue for the active locale.
 *
 *     const copy = useCopy();
 *     <h1>{copy.nav.today}</h1>
 */
export function useCopy(): Messages {
  return useLocaleContext().copy;
}
