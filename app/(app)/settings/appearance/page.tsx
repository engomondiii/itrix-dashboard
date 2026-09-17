'use client';

/**
 * Appearance settings — theme and language.
 *
 * Native radio inputs (visually hidden, `peer`-styled labels), not
 * button-with-aria — radios give arrow-key group navigation, form semantics,
 * and screen-reader announcement for free, and "pick one of three" is
 * exactly what a radio group is.
 *
 * The card click passes its coordinates to `setTheme`, so choosing a theme
 * here gets the same circle-reveal transition as the header toggle.
 *
 * This section is also the template for non-form settings pages: state that
 * lives client-side (theme, density, language) renders as a choice group
 * inside a `SettingsSection` with no Save button — the choice applies
 * immediately and persistence is the provider's job.
 */

import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { useTheme, type Theme, type ThemeOrigin } from '@/components/theme-provider';
import { SettingsSection } from '@/components/ui/settings-section';
import { LOCALE_NAMES, LOCALES, type Locale } from '@/lib/i18n/config';
import { useCopy, useLocale } from '@/lib/i18n/locale-provider';

/**
 * The shared radio-card body.
 *
 * Extracted when the language group arrived rather than copied: two groups
 * with the same peer-checked styling written twice is two places to forget
 * a focus ring.
 */
function ChoiceCard({
  name,
  value,
  checked,
  label,
  hint,
  icon,
  onSelect,
  onClick,
}: {
  name: string;
  value: string;
  checked: boolean;
  label: ReactNode;
  hint: string;
  icon?: ReactNode;
  onSelect: () => void;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}) {
  return (
    <label onClick={onClick} className="cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onSelect}
        className="peer sr-only"
      />
      <span
        className={
          'flex flex-col gap-1.5 rounded-lg border border-border p-3 transition-colors ' +
          'hover:border-ring/40 hover:bg-accent/40 ' +
          'peer-checked:border-primary peer-checked:bg-accent ' +
          'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background'
        }
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          {icon}
          {label}
        </span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </span>
    </label>
  );
}

function ThemeChoice() {
  const { theme, setTheme } = useTheme();
  const copy = useCopy();

  const options: Array<{ value: Theme; label: string; hint: string; icon: LucideIcon }> = [
    { value: 'system', label: copy.appearance.system, hint: copy.appearance.systemHint, icon: Monitor },
    { value: 'light', label: copy.appearance.light, hint: copy.appearance.lightHint, icon: Sun },
    { value: 'dark', label: copy.appearance.dark, hint: copy.appearance.darkHint, icon: Moon },
  ];

  function originFrom(event: React.MouseEvent<HTMLElement>): ThemeOrigin {
    const rect = event.currentTarget.getBoundingClientRect();
    return event.clientX || event.clientY
      ? { x: event.clientX, y: event.clientY }
      : { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  return (
    <SettingsSection title={copy.appearance.themeTitle} description={copy.appearance.themeDescription}>
      <fieldset>
        <legend className="sr-only">{copy.appearance.themeTitle}</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {options.map((option) => (
            <ChoiceCard
              key={option.value}
              name="theme"
              value={option.value}
              checked={theme === option.value}
              label={option.label}
              hint={option.hint}
              icon={<option.icon className="h-4 w-4" aria-hidden="true" />}
              // The change handler has no coordinates; the click does.
              onClick={(event) => {
                if (theme !== option.value) setTheme(option.value, originFrom(event));
              }}
              // Selection is applied by the label's click handler (it has the
              // coordinates); keyboard arrow-selection lands here.
              onSelect={() => {
                if (theme !== option.value) setTheme(option.value);
              }}
            />
          ))}
        </div>
      </fieldset>
    </SettingsSection>
  );
}

function LanguageChoice() {
  const { locale, setLocale } = useLocale();
  const copy = useCopy();

  const hints: Record<Locale, string> = {
    en: copy.appearance.englishHint,
    ko: copy.appearance.koreanHint,
  };

  return (
    <SettingsSection
      title={copy.appearance.languageTitle}
      description={copy.appearance.languageDescription}
    >
      <fieldset>
        <legend className="sr-only">{copy.appearance.languageLegend}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {LOCALES.map((value) => (
            <ChoiceCard
              key={value}
              name="locale"
              value={value}
              checked={locale === value}
              // `lang` on the label so a screen reader pronounces "한국어"
              // with Korean phonetics while the rest of the page is English.
              label={<span lang={value}>{LOCALE_NAMES[value]}</span>}
              hint={hints[value]}
              onSelect={() => setLocale(value)}
            />
          ))}
        </div>
      </fieldset>
    </SettingsSection>
  );
}

export default function AppearanceSettingsPage() {
  return (
    <>
      <ThemeChoice />
      <LanguageChoice />
    </>
  );
}
