'use client';

/**
 * The authenticated app chrome: collapsible icon sidebar plus a top bar with
 * the sidebar trigger, theme toggle and a user menu. Mounted once by
 * `app/(app)/layout.tsx`, which also guards the whole group — pages inside
 * it render content only.
 *
 * Harvested from a production dashboard shell (see PATTERNS.md §21):
 * command palette (Ctrl+K), notification bell, theme toggle, user menu. The
 * production version also carried an account switcher; that needs a
 * multi-role backend, so the template ships this header as its socket.
 */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { LogOut, Settings } from 'lucide-react';

import { useAuth } from '@/lib/auth/auth-context';
import { ThemeToggle } from '@/components/theme-toggle';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { CommandPalette } from '@/components/layout/command-palette';
import { NotificationBell } from '@/components/layout/notification-bell';
import { OfficeClock } from '@/components/layout/office-clock';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const fullName = user.name;
  const initials =
    user.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || (user.email?.[0] ?? '?').toUpperCase();

  async function handleSignOut() {
    await logout();
    router.replace('/login');
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-8 items-center gap-2 rounded-lg px-1.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground">
            {initials}
          </span>
          <span className="hidden max-w-[160px] truncate text-xs lg:inline">{user.email}</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={6} className="w-60">
        <div className="mb-1 rounded-md bg-muted/50 px-3 py-2.5">
          {fullName && <p className="truncate text-sm font-semibold">{fullName}</p>}
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings/profile">
            <Settings />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOut />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-4 sm:gap-3 sm:px-6">
          <SidebarTrigger className="-ml-1" />

          <div className="flex-1" />

          <OfficeClock />
          <div className="mx-0.5 hidden h-5 w-px bg-border sm:block" />
          <CommandPalette />
          <NotificationBell />
          <ThemeToggle className="text-foreground/80 hover:bg-muted" />
          <div className="mx-0.5 hidden h-5 w-px bg-border sm:block" />
          <UserMenu />
        </header>

        {/*
          min-w-0 is load-bearing, not tidiness. A flex child defaults to
          min-width:auto, so a wide table would push the content past the
          viewport and scroll the whole page sideways instead of scrolling
          inside its own container.
        */}
        <div className="min-w-0 flex-1 px-4 py-5 md:px-6 md:py-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
