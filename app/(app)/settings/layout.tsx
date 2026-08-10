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
import { KeyRound, Palette, UserRound, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface SettingsNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Shown as the page subtitle while this section is active. */
  description: string;
}

const SETTINGS_NAV: SettingsNavItem[] = [
  {
    label: 'Profile',
    href: '/settings/profile',
    icon: UserRound,
    description: 'Your name and account details.',
  },
  {
    label: 'Security',
    href: '/settings/security',
    icon: KeyRound,
    description: 'Password and sign-in protection.',
  },
  {
    label: 'Appearance',
    href: '/settings/appearance',
    icon: Palette,
    description: 'Theme and display preferences.',
  },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '';
  const active = SETTINGS_NAV.find((item) => pathname.startsWith(item.href));

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        {active && <p className="mt-1 text-sm text-muted-foreground">{active.description}</p>}
      </header>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        {/*
          Desktop: a sticky left rail. Mobile: the same list as a horizontal
          scroller — tabs without a second component to maintain.
        */}
        <nav aria-label="Settings sections" className="lg:w-48 lg:shrink-0">
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
                    {item.label}
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
