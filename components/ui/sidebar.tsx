'use client';

/**
 * Collapsible app sidebar, adapted from shadcn/ui's sidebar and trimmed to
 * what the template's shell consumes. See PATTERNS.md §21 for the harvest
 * notes.
 *
 * What survives from the original: the provider with cookie-persisted state
 * and the Ctrl/Cmd+B shortcut, desktop icon-collapse driven by data
 * attributes, the mobile drawer, the rail, and tooltips on collapsed items.
 * What was cut: the `floating`/`inset` variants, cva variant plumbing,
 * `SidebarInput`/`SidebarMenuSkeleton`/`SidebarMenuAction`/`SidebarMenuSub*`
 * (nothing here renders nested nav or in-sidebar search), and the standalone
 * Button/Sheet/Tooltip component dependencies — the drawer and tooltips are
 * built directly on the Radix primitives.
 *
 * Styling contract: the `group peer` wrapper exposes
 * `data-state="expanded|collapsed"` and `data-collapsible="icon|offcanvas"`,
 * and every child styles itself off `group-data-[...]` selectors. Colours
 * come from the `sidebar-*` token family defined in app/globals.css.
 */

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { Slot } from '@radix-ui/react-slot';
import { PanelLeft } from 'lucide-react';

import { cn } from '@/lib/utils';

const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_MOBILE = '18rem';
const SIDEBAR_WIDTH_ICON = '3rem';
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

/**
 * One breakpoint for both the JS hook and the CSS classes (Tailwind `lg`).
 * If they disagree there is a window where neither the desktop sidebar nor
 * the mobile drawer renders.
 */
const MOBILE_BREAKPOINT = 1024;

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface SidebarContextValue {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) throw new Error('useSidebar must be used within a SidebarProvider.');
  return context;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function SidebarProvider({
  defaultOpen = true,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<'div'> & { defaultOpen?: boolean }) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [open, _setOpen] = React.useState(defaultOpen);

  // Reads the persisted state on mount rather than during render — the server
  // has no cookie, and an SSR/client mismatch here would tear the whole shell.
  // Deliberate setState-in-effect for that reason (same trade as the theme
  // provider: one extra render beats a hydration error).
  React.useEffect(() => {
    const match = document.cookie.match(new RegExp(`(?:^|; )${SIDEBAR_COOKIE_NAME}=(true|false)`));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (match) _setOpen(match[1] === 'true');
  }, []);

  const setOpen = React.useCallback((value: boolean) => {
    _setOpen(value);
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${value}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
  }, []);

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) setOpenMobile((v) => !v);
    else setOpen(!open);
  }, [isMobile, open, setOpen]);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleSidebar]);

  const state = open ? 'expanded' : 'collapsed';

  const contextValue = React.useMemo<SidebarContextValue>(
    () => ({ state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar }),
    [state, open, setOpen, openMobile, isMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipPrimitive.Provider delayDuration={0}>
        <div
          style={
            {
              '--sidebar-width': SIDEBAR_WIDTH,
              '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn('group/sidebar-wrapper flex min-h-svh w-full', className)}
          {...props}
        >
          {children}
        </div>
      </TooltipPrimitive.Provider>
    </SidebarContext.Provider>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export function Sidebar({
  collapsible = 'icon',
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & { collapsible?: 'icon' | 'offcanvas' }) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (isMobile) {
    return (
      <DialogPrimitive.Root open={openMobile} onOpenChange={setOpenMobile}>
        <DialogPrimitive.Portal>
          {/* No animate-in/out utilities — this template doesn't ship the
              tailwindcss-animate plugin, and a drawer works fine without it. */}
          <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/50" />
          <DialogPrimitive.Content
            data-sidebar="sidebar"
            data-mobile="true"
            style={{ '--sidebar-width': SIDEBAR_WIDTH_MOBILE } as React.CSSProperties}
            className="fixed inset-y-0 left-0 z-50 flex h-full w-[var(--sidebar-width)] flex-col bg-sidebar p-0 text-sidebar-foreground shadow-lg outline-none"
          >
            <DialogPrimitive.Title className="sr-only">Navigation</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              App navigation drawer
            </DialogPrimitive.Description>
            {children}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    );
  }

  return (
    <div
      className="group peer hidden text-sidebar-foreground lg:block"
      data-state={state}
      data-collapsible={state === 'collapsed' ? collapsible : ''}
      data-side="left"
    >
      {/* Spacer — reserves layout width; the sidebar itself is fixed. */}
      <div
        className={cn(
          'relative w-[var(--sidebar-width)] bg-transparent transition-[width] duration-200 ease-linear',
          'group-data-[collapsible=offcanvas]:w-0',
          'group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)]',
        )}
      />
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-10 hidden h-svh w-[var(--sidebar-width)] border-r border-sidebar-border transition-[left,width] duration-200 ease-linear lg:flex',
          'group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]',
          'group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)]',
          className,
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          className="flex h-full w-full flex-col bg-sidebar"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Trigger & rail ──────────────────────────────────────────────────────────

export function SidebarTrigger({ className, onClick, ...props }: React.ComponentProps<'button'>) {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      type="button"
      data-sidebar="trigger"
      aria-label="Toggle sidebar"
      className={cn(
        'inline-flex h-7 w-7 items-center justify-center rounded-md text-foreground/80 transition-colors hover:bg-muted hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
    </button>
  );
}

/** Invisible grab strip on the sidebar's edge — click anywhere on it to toggle. */
export function SidebarRail({ className, ...props }: React.ComponentProps<'button'>) {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      type="button"
      data-sidebar="rail"
      aria-label="Toggle sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle sidebar"
      className={cn(
        'absolute inset-y-0 -right-4 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear lg:flex',
        'after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border',
        'group-data-[state=collapsed]:cursor-e-resize group-data-[state=expanded]:cursor-w-resize',
        className,
      )}
      {...props}
    />
  );
}

/** The content column beside the sidebar. */
export function SidebarInset({ className, ...props }: React.ComponentProps<'main'>) {
  return (
    <main
      className={cn('relative flex w-full min-w-0 flex-1 flex-col bg-background', className)}
      {...props}
    />
  );
}

// ─── Structure ───────────────────────────────────────────────────────────────

export function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-sidebar="header" className={cn('flex flex-col gap-2 p-2', className)} {...props} />;
}

export function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-sidebar="footer" className={cn('flex flex-col gap-2 p-2', className)} {...props} />;
}

export function SidebarContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-sidebar="content"
      className={cn(
        'flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden',
        className,
      )}
      {...props}
    />
  );
}

export function SidebarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-sidebar="group"
      className={cn('relative flex w-full min-w-0 flex-col p-2', className)}
      {...props}
    />
  );
}

export function SidebarGroupLabel({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-sidebar="group-label"
      className={cn(
        'flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70',
        'transition-[margin,opacity] duration-200 ease-linear',
        'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0',
        className,
      )}
      {...props}
    />
  );
}

export function SidebarGroupContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-sidebar="group-content" className={cn('w-full text-sm', className)} {...props} />;
}

// ─── Menu ────────────────────────────────────────────────────────────────────

export function SidebarMenu({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul data-sidebar="menu" className={cn('flex w-full min-w-0 flex-col gap-1', className)} {...props} />
  );
}

export function SidebarMenuItem({ className, ...props }: React.ComponentProps<'li'>) {
  return <li data-sidebar="menu-item" className={cn('group/menu-item relative', className)} {...props} />;
}

export function SidebarMenuButton({
  asChild = false,
  isActive = false,
  tooltip,
  className,
  ...props
}: React.ComponentProps<'button'> & {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string;
}) {
  const Comp = asChild ? Slot : 'button';
  const { isMobile, state } = useSidebar();

  const button = (
    <Comp
      data-sidebar="menu-button"
      data-active={isActive}
      className={cn(
        'peer/menu-button flex h-8 w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none',
        'transition-[width,height,padding,background-color,color] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        'focus-visible:ring-2 focus-visible:ring-sidebar-ring',
        'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
        // Active = tinted primary rather than the stock shadcn neutral wash;
        // with the neutral default palette that is a quiet grey tint, and a
        // branded palette gets brand-coloured active items for free.
        'data-[active=true]:bg-sidebar-primary/10 data-[active=true]:font-medium data-[active=true]:text-sidebar-primary',
        'group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2',
        '[&>span:last-child]:truncate [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0',
        className,
      )}
      {...props}
    />
  );

  if (!tooltip) return button;

  // The tooltip earns its keep only when the rail is icon-only; hidden
  // otherwise so expanded items don't grow a redundant label.
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{button}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side="right"
          align="center"
          hidden={state !== 'collapsed' || isMobile}
          className="z-50 rounded-md bg-foreground px-2 py-1 text-xs text-background shadow-md"
        >
          {tooltip}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

export function SidebarMenuBadge({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-sidebar="menu-badge"
      className={cn(
        'pointer-events-none absolute right-1 top-1.5 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground',
        'group-data-[collapsible=icon]:hidden',
        className,
      )}
      {...props}
    />
  );
}
