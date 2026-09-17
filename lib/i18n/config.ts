/**
 * Locale configuration.
 *
 * Two locales, matching Surface 1 (`itrix-web`): English is the source of
 * truth and Korean is a full translation of it. The operating site is Seoul,
 * so Korean is not a nice-to-have here — but the console is also worked from
 * Nairobi, which is why English stays the default rather than the fallback.
 *
 * The preference is stored in a COOKIE, not localStorage. Surface 1 uses
 * localStorage and pays for it: the server always renders English, then the
 * page flips to Korean after hydration, so `:lang(ko)` styling never applies
 * to the first paint. A cookie is readable in `app/layout.tsx` while it is
 * still a Server Component, so the correct `lang` attribute and the correct
 * strings are in the HTML that is sent.
 */

export const LOCALES = ['en', 'ko'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

/**
 * Read by the server (`lib/i18n/server.ts`) and written by the client
 * (`lib/i18n/locale-provider.tsx`). Named to match Surface 1's storage key so
 * the two surfaces are recognisably the same setting.
 */
export const LOCALE_COOKIE = 'itrix-locale';

/** A year. The preference is not sensitive and re-asking it is pure friction. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Anything unrecognised — absent cookie, stale value, hand-edited — is English. */
export function resolveLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** What the switcher offers. Each language is named in itself, never translated. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  ko: '한국어',
};

/**
 * The compact form for the header toggle, where "English" is too wide.
 * Still the language's own name — a Korean reader looking for the way out
 * must be able to recognise the label without reading English first.
 */
export const LOCALE_SHORT_NAMES: Record<Locale, string> = {
  en: 'EN',
  ko: '한국어',
};

/** With two locales, "the other one" is the whole of the toggle's logic. */
export function nextLocale(current: Locale): Locale {
  return current === 'en' ? 'ko' : 'en';
}
