'use client';

/**
 * The settings area: one layout, one sub-navigation, one page per section.
 *
 * To add a section ("Billing", "API keys", "Team"):
 *   1. create `app/(app)/settings/<slug>/page.tsx` built from
 *      `<SettingsSection>` cards
 *   2. add one entry to SETTINGS_NAV below
 * Nothing else — the layout, active states, and mobile behaviour are already
 * handled here.
 *
 * Sections are routes, not tabs-in-state, deliberately: a settings URL can
 * be pasted into a bug report ("go to /settings/security"), survives reload,
 * and back navigation works. The same reasoning as the entity list keeping
 * its state in the URL.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Palette, UserRound, UsersRound, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { useCopy } from '@/lib/i18n/locale-provider';
import type { Messages } from '@/lib/i18n/messages';
import { cn } from '@/lib/utils';

type SettingsCopyKey = keyof Messages['settings'];

interface SettingsNavItem {
  /** Keys into `copy.settings`, resolved at render — see NAV_GROUPS in app-sidebar. */
  labelKey: SettingsCopyKey;
  href: string;
  icon: LucideIcon;
  /** Shown as the page subtitle while this section is active. */
  descriptionKey: SettingsCopyKey;
}

const SETTINGS_NAV: SettingsNavItem[] = [
  {
    labelKey: 'profile',
    href: '/settings/profile',
    icon: UserRound,
    descriptionKey: 'profileDescription',
  },
  {
    labelKey: 'team',
    href: '/settings/team',
    icon: UsersRound,
    descriptionKey: 'teamDescription',
  },
  // No Security section: the team plane has no password-change endpoint —
  // password resets go through an admin. Restore when the backend grows one.
  {
    labelKey: 'appearance',
    href: '/settings/appearance',
    icon: Palette,
    descriptionKey: 'appearanceDescription',
  },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '';
  const copy = useCopy();
  const active = SETTINGS_NAV.find((item) => pathname.startsWith(item.href));

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">{copy.nav.settings}</h1>
        {active && (
          <p className="mt-1 text-sm text-muted-foreground">
            {copy.settings[active.descriptionKey]}
          </p>
        )}
      </header>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        {/*
          Desktop: a sticky left rail. Mobile: the same list as a horizontal
          scroller — tabs without a second component to maintain.
        */}
        <nav aria-label={copy.settings.sectionsLabel} className="lg:w-48 lg:shrink-0">
          <ul className="flex gap-1 overflow-x-auto lg:sticky lg:top-6 lg:flex-col lg:overflow-visible">
            {SETTINGS_NAV.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <li key={item.href} className="shrink-0">
                  <Link
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-accent font-medium text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                    )}
                  >
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                    {copy.settings[item.labelKey]}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="min-w-0 max-w-2xl flex-1 space-y-6">{children}</div>
      </div>
    </div>
  );
}
