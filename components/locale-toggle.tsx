'use client';

/**
 * English / Korean switch, for the top bar.
 *
 * The sibling of `theme-toggle.tsx`, and deliberately simpler in one way:
 * there is no mounted guard and no `suppressHydrationWarning`. The theme
 * toggle needs both because the theme lives in localStorage, which the server
 * cannot read, so its label can only be rendered after hydration. The locale
 * lives in a cookie the server DOES read, so the correct label is in the
 * first HTML and the markup matches on hydration.
 *
 * Settings → Appearance has the same control as a labelled radio group with
 * explanatory hints. This one is the two-second version for someone who
 * already knows what they want — and, more importantly, it is discoverable
 * from any screen. A language switch buried in settings is no use to a person
 * who cannot read the settings menu.
 */

import { Languages } from 'lucide-react';

import { LOCALE_NAMES, LOCALE_SHORT_NAMES, nextLocale } from '@/lib/i18n/config';
import { useCopy, useLocale } from '@/lib/i18n/locale-provider';

export function LocaleToggle({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useLocale();
  const copy = useCopy();

  const next = nextLocale(locale);

  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      aria-label={copy.appearance.languageToggle(LOCALE_NAMES[locale], LOCALE_NAMES[next])}
      title={copy.appearance.languageToggleTitle(LOCALE_NAMES[locale], LOCALE_NAMES[next])}
      className={[
        'inline-flex h-7 min-w-7 items-center justify-center gap-1.5 rounded-md',
        'px-2 text-xs font-medium',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background',
        className,
      ].join(' ')}
    >
      <Languages className="h-3.5 w-3.5" aria-hidden="true" />
      {/*
        `lang` on the label so a screen reader pronounces "한국어" with Korean
        phonetics rather than spelling it out in the page language.
      */}
      <span className="hidden sm:inline" lang={locale}>
        {LOCALE_SHORT_NAMES[locale]}
      </span>
    </button>
  );
}

export default LocaleToggle;
