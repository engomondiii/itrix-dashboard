'use client';

/**
 * The app's left navigation. Grouped, icon-led items in the collapsible rail
 * (components/ui/sidebar).
 *
 * This is configuration, not framework: edit APP_NAME and NAV_GROUPS in
 * place. Items are plain links; active detection is longest-matching-prefix
 * so `/products/123` lights up Products without special-casing detail routes.
 * A `badge` on an item renders in the expanded rail only — wire it to a real
 * count (unread, pending) rather than decorating.
 */

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen,
  Building2,
  ChartLine,
  ListTodo,
  LogOut,
  MessagesSquare,
  Settings,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react';

import { useAuth } from '@/lib/auth/auth-context';
import { useCopy } from '@/lib/i18n/locale-provider';
import type { Messages } from '@/lib/i18n/messages';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';

/** A key into `copy.nav`, so a destination cannot be added without a label in both locales. */
export type NavLabelKey = keyof Messages['nav'];

export interface NavItem {
  /**
   * Not the label itself. The rail and the command palette both render this
   * model, so resolving the key at render is what keeps one nav definition
   * working in two languages — and makes an untranslated destination a
   * compile error rather than an English word in a Korean menu.
   */
  labelKey: NavLabelKey;
  icon: LucideIcon;
  href: string;
  badge?: string;
}

export interface NavGroup {
  labelKey?: NavLabelKey;
  items: NavItem[];
}

// Exported so the command palette offers the same destinations as the rail —
// one nav model, two presentations.
//
// Deliberately flat and short (7 + settings). Labels are staff language, not
// spec language — see the terminology map in the rethink plan. Anything that
// was a page because a spec named it is a filter, tab, or Today item instead.
export const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { labelKey: 'today', icon: ListTodo, href: '/today' },
      { labelKey: 'leads', icon: Users, href: '/leads' },
      { labelKey: 'conversations', icon: MessagesSquare, href: '/conversations' },
      { labelKey: 'approvals', icon: ShieldCheck, href: '/approvals' },
      { labelKey: 'customers', icon: Building2, href: '/customers' },
      { labelKey: 'insights', icon: ChartLine, href: '/insights' },
      { labelKey: 'library', icon: BookOpen, href: '/library' },
    ],
  },
  {
    labelKey: 'account',
    items: [{ labelKey: 'settings', icon: Settings, href: '/settings' }],
  },
];

export function AppSidebar() {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const { logout } = useAuth();
  const { isMobile, setOpenMobile } = useSidebar();
  const copy = useCopy();

  // Longest matching prefix wins, so overlapping hrefs (/products,
  // /products/archive) highlight only the more specific item.
  const activeHref = NAV_GROUPS.flatMap((g) => g.items)
    .filter((item) => pathname.startsWith(item.href))
    .reduce<string | null>(
      (best, item) => (best === null || item.href.length > best.length ? item.href : best),
      null,
    );

  async function handleSignOut() {
    await logout();
    router.replace('/login');
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link
          href="/today"
          className="flex min-w-0 items-center gap-2.5 px-1 py-1 text-sm font-bold"
        >
          {/* The solid-X mark: inverse cut on an ink tile. dark:bg-card keeps
              the tile on structure-900 when --primary flips light. */}
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-primary dark:bg-card">
            <Image src="/brand/itrix-x-inverse.png" alt="" width={16} height={16} className="h-4 w-4" />
          </span>
          <span className="min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="block truncate text-base font-semibold">{copy.app.name}</span>
            <span className="block truncate text-[11px] font-normal text-sidebar-foreground/60">
              {copy.app.tagline}
            </span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {NAV_GROUPS.map((group, gi) => (
          <SidebarGroup key={group.labelKey ?? gi}>
            {group.labelKey && <SidebarGroupLabel>{copy.nav[group.labelKey]}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      tooltip={copy.nav[item.labelKey]}
                      isActive={item.href === activeHref}
                    >
                      <Link
                        href={item.href}
                        onClick={() => {
                          // The drawer must not outlive the navigation it
                          // just performed.
                          if (isMobile) setOpenMobile(false);
                        }}
                      >
                        <item.icon />
                        <span>{copy.nav[item.labelKey]}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              tooltip={copy.nav.signOut}
              className="text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut />
              <span>{copy.nav.signOut}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
