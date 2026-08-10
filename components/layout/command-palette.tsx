'use client';

/**
 * Command palette — Ctrl+K / ⌘K.
 *
 * Hand-rolled on the radix Dialog already in the dependency tree, not cmdk:
 * the template's palette has three command sources (navigation, theme, sign
 * out) and a substring filter, which is ~200 lines to own versus a dependency
 * to configure. If a consuming project outgrows it — nested pages, async
 * search — swap the internals; the mounting seam in `app-shell.tsx` stays.
 *
 * Commands come from the same `NAV_GROUPS` the sidebar renders, so the
 * palette can never offer a destination the rail does not have. Recent
 * selections persist to localStorage and surface when the query is empty —
 * the two or three screens a person actually lives in float to the top.
 *
 * Keyboard contract (the part a quick implementation usually misses):
 * ArrowUp/Down move the active option, Enter runs it, Escape closes, and the
 * input keeps focus the whole time — selection is conveyed to assistive tech
 * via `aria-activedescendant`, not by moving DOM focus.
 */

import * as Dialog from '@radix-ui/react-dialog';
import { useRouter } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { LogOut, Moon, Monitor, Search, Sun } from 'lucide-react';

import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import { NAV_GROUPS } from '@/components/layout/app-sidebar';

interface Command {
  id: string;
  label: string;
  group: string;
  icon: ReactNode;
  /** Extra strings the filter matches besides the label. */
  keywords?: string;
  /** Excluded from "Recent" — re-running it by accident is costly. */
  noRecent?: boolean;
  run: () => void | Promise<void>;
}

const RECENT_KEY = 'palette:recent';
const RECENT_MAX = 5;

function readRecents(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function pushRecent(id: string): void {
  try {
    const next = [id, ...readRecents().filter((r) => r !== id)].slice(0, RECENT_MAX);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable — recents just don't persist.
  }
}

export function CommandPalette() {
  const router = useRouter();
  const { logout } = useAuth();
  const { setTheme } = useTheme();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [recents, setRecents] = useState<string[]>([]);

  const commands = useMemo<Command[]>(() => {
    const nav: Command[] = NAV_GROUPS.flatMap((group) =>
      group.items.map((item) => ({
        id: `nav:${item.href}`,
        label: item.label,
        group: group.label ?? 'Navigate',
        icon: <item.icon className="h-4 w-4" aria-hidden="true" />,
        keywords: item.href,
        run: () => router.push(item.href),
      })),
    );

    const theme: Command[] = [
      { id: 'theme:light', label: 'Theme: Light', icon: <Sun className="h-4 w-4" aria-hidden="true" />, run: () => setTheme('light') },
      { id: 'theme:dark', label: 'Theme: Dark', icon: <Moon className="h-4 w-4" aria-hidden="true" />, run: () => setTheme('dark') },
      { id: 'theme:system', label: 'Theme: System', icon: <Monitor className="h-4 w-4" aria-hidden="true" />, run: () => setTheme('system') },
    ].map((c) => ({ ...c, group: 'Appearance', keywords: 'theme dark light mode' }));

    const session: Command[] = [
      {
        id: 'auth:sign-out',
        label: 'Sign out',
        group: 'Session',
        icon: <LogOut className="h-4 w-4" aria-hidden="true" />,
        keywords: 'logout',
        noRecent: true,
        run: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ];

    return [...nav, ...theme, ...session];
  }, [router, setTheme, logout]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle) {
      return commands.filter((c) =>
        `${c.label} ${c.keywords ?? ''}`.toLowerCase().includes(needle),
      );
    }
    // Empty query: recents first (in stored order), then everything else.
    const byId = new Map(commands.map((c) => [c.id, c]));
    const recent = recents
      .map((id) => byId.get(id))
      .filter((c): c is Command => Boolean(c))
      .map((c) => ({ ...c, group: 'Recent' }));
    const rest = commands.filter((c) => !recents.includes(c.id));
    return [...recent, ...rest];
  }, [commands, query, recents]);

  // Clamp rather than reset on every keystroke so the arrow-key position
  // survives typing when the filtered list still contains it.
  const active = Math.min(activeIndex, Math.max(0, visible.length - 1));

  const openPalette = useCallback(() => {
    setQuery('');
    setActiveIndex(0);
    setRecents(readRecents());
    setOpen(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        if (open) setOpen(false);
        else openPalette();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, openPalette]);

  async function runCommand(command: Command) {
    setOpen(false);
    if (!command.noRecent) pushRecent(command.id);
    await command.run();
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex(visible.length ? (active + 1) % visible.length : 0);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(visible.length ? (active - 1 + visible.length) % visible.length : 0);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const command = visible[active];
      if (command) void runCommand(command);
    }
  }

  // Group headers are derived from the flat visible list so arrow-key order
  // and render order can never disagree.
  let lastGroup: string | null = null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={openPalette}
        className="hidden gap-2 px-2.5 text-xs font-normal text-muted-foreground sm:flex"
      >
        <Search className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Search…</span>
        <kbd className="rounded border border-border bg-muted px-1 font-mono text-[10px]">
          Ctrl K
        </kbd>
      </Button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 animate-fade-in bg-black/50" />
          <Dialog.Content
            className="fixed left-1/2 top-[18%] z-50 w-full max-w-lg -translate-x-1/2 animate-zoom-in overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg"
            // The input must keep focus; radix would move it to the content.
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              (document.getElementById('command-palette-input') as HTMLInputElement | null)?.focus();
            }}
          >
            <Dialog.Title className="sr-only">Command palette</Dialog.Title>
            <Dialog.Description className="sr-only">
              Type to filter commands, arrow keys to choose, Enter to run.
            </Dialog.Description>

            <div className="flex items-center gap-2 border-b border-border px-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <input
                id="command-palette-input"
                role="combobox"
                aria-expanded="true"
                aria-controls="command-palette-list"
                aria-activedescendant={visible[active] ? `command-${visible[active].id}` : undefined}
                aria-label="Search commands"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleInputKeyDown}
                placeholder="Type a command or destination…"
                className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            <ul
              id="command-palette-list"
              role="listbox"
              aria-label="Commands"
              className="max-h-72 overflow-y-auto p-1.5"
            >
              {visible.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                  Nothing matches “{query}”.
                </li>
              )}

              {visible.map((command, index) => {
                const header = command.group !== lastGroup ? command.group : null;
                lastGroup = command.group;
                return (
                  <li key={command.id}>
                    {header && (
                      <p
                        aria-hidden="true"
                        className="px-2.5 pb-1 pt-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
                      >
                        {header}
                      </p>
                    )}
                    <button
                      type="button"
                      id={`command-${command.id}`}
                      role="option"
                      aria-selected={index === active}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => void runCommand(command)}
                      className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors ${
                        index === active
                          ? 'bg-accent text-accent-foreground'
                          : 'text-popover-foreground'
                      }`}
                    >
                      <span className="text-muted-foreground">{command.icon}</span>
                      <span className="flex-1 truncate">{command.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
