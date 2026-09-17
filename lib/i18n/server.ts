/**
 * Reading the locale on the server.
 *
 * This is what lets the first response be correct rather than corrected:
 * `app/layout.tsx` calls `getLocale()` to set `<html lang>` and to seed the
 * client provider, and Server Components (`app/not-found.tsx`) call
 * `getCopy()` to render translated text with no client JavaScript at all.
 *
 * No `import 'server-only'` guard: `next/headers` is itself server-only and
 * fails the build if this module is pulled into a Client Component, so the
 * extra dependency would buy nothing.
 *
 * Note that calling `cookies()` opts the caller into dynamic rendering. That
 * is correct here and costs nothing: this console is behind an auth guard and
 * has `robots: noindex` — there is no static output to preserve.
 */

import { cookies } from 'next/headers';

import { LOCALE_COOKIE, resolveLocale, type Locale } from './config';
import { MESSAGES, type Messages } from './messages';

/** The visitor's locale, or English when the cookie is absent or unrecognised. */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return resolveLocale(store.get(LOCALE_COOKIE)?.value);
}

/** The copy catalogue for the current request. The server-side `useCopy()`. */
export async function getCopy(): Promise<Messages> {
  return MESSAGES[await getLocale()];
}
