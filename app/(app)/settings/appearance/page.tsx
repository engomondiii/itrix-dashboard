'use client';

/**
 * Appearance settings.
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

import { useTheme, type Theme, type ThemeOrigin } from '@/components/theme-provider';
import { SettingsSection } from '@/components/ui/settings-section';

const OPTIONS: Array<{ value: Theme; label: string; hint: string; icon: LucideIcon }> = [
  { value: 'system', label: 'System', hint: 'Follows your OS preference, live.', icon: Monitor },
  { value: 'light', label: 'Light', hint: 'Always light, everywhere.', icon: Sun },
  { value: 'dark', label: 'Dark', hint: 'Always dark, everywhere.', icon: Moon },
];

export default function AppearanceSettingsPage() {
  const { theme, setTheme } = useTheme();

  function originFrom(event: React.MouseEvent<HTMLElement>): ThemeOrigin {
    const rect = event.currentTarget.getBoundingClientRect();
    return event.clientX || event.clientY
      ? { x: event.clientX, y: event.clientY }
      : { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  return (
    <SettingsSection
      title="Theme"
      description="Applies immediately and persists in this browser. “System” tracks your OS setting as it changes."
    >
      <fieldset>
        <legend className="sr-only">Theme</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {OPTIONS.map((option) => (
            <label
              key={option.value}
              onClick={(event) => {
                // The change handler has no coordinates; the click does.
                if (theme !== option.value) setTheme(option.value, originFrom(event));
              }}
              className="cursor-pointer"
            >
              <input
                type="radio"
                name="theme"
                value={option.value}
                checked={theme === option.value}
                // Selection is applied by the label's click handler (it has
                // the coordinates); keyboard arrow-selection lands here.
                onChange={() => {
                  if (theme !== option.value) setTheme(option.value);
                }}
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
                  <option.icon className="h-4 w-4" aria-hidden="true" />
                  {option.label}
                </span>
                <span className="text-xs text-muted-foreground">{option.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </SettingsSection>
  );
}
