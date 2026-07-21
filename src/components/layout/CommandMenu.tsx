"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeftIcon, SearchIcon } from "lucide-react";

import { NAV_ICONS } from "@/components/layout/nav-icons";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { navigation } from "@/config/navigation.config";
import { cn } from "@/lib/utils";

interface Command {
  label: string;
  href: string;
  icon: string;
  /** Group/section the destination belongs to. */
  section: string;
}

/** Flatten the nav tree into a searchable list of destinations. */
function buildCommands(): Command[] {
  const out: Command[] = [];
  for (const section of navigation) {
    const group = section.label ?? "General";
    for (const item of section.items) {
      out.push({ label: item.label, href: item.href, icon: item.icon, section: group });
      for (const child of item.children ?? []) {
        out.push({
          label: child.label,
          href: child.href,
          icon: child.icon,
          section: item.label,
        });
      }
    }
  }
  return out;
}

export function CommandMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = useMemo(() => buildCommands(), []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) || c.section.toLowerCase().includes(q),
    );
  }, [commands, query]);

  const openMenu = useCallback(() => {
    setQuery("");
    setActiveIndex(0);
    setOpen(true);
  }, []);

  // ⌘K / Ctrl+K toggles the palette from anywhere.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) setOpen(false);
        else openMenu();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, openMenu]);

  const onQueryChange = (value: string) => {
    setQuery(value);
    setActiveIndex(0);
  };

  const select = useCallback(
    (cmd: Command | undefined) => {
      if (!cmd) return;
      setOpen(false);
      router.push(cmd.href);
    },
    [router],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      select(results[activeIndex]);
    }
  };

  return (
    <>
      {/* Full trigger (sm and up) */}
      <button
        type="button"
        onClick={openMenu}
        aria-label="Search"
        className="hidden h-8 w-56 items-center gap-2 rounded-lg border border-border-soft bg-soft/60 pr-2 pl-2.5 text-sec text-ink-secondary transition-colors hover:border-border-medium hover:bg-soft sm:flex"
      >
        <SearchIcon className="size-4 shrink-0" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="rounded border border-border-soft bg-surface px-1 py-0.5 font-mono text-[10px] text-ink-secondary">
          ⌘K
        </kbd>
      </button>

      {/* Icon trigger (mobile) */}
      <button
        type="button"
        onClick={openMenu}
        aria-label="Search"
        className="inline-flex size-7 items-center justify-center rounded-md text-ink-secondary transition-colors hover:bg-muted sm:hidden"
      >
        <SearchIcon className="size-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="top-24 max-w-xl translate-y-0 gap-0 p-0 sm:max-w-xl"
        >
          <DialogTitle className="sr-only">Command menu</DialogTitle>

          <div className="flex items-center gap-2.5 border-b border-border-soft px-3.5">
            <SearchIcon className="size-4 shrink-0 text-ink-secondary" />
            <input
              ref={inputRef}
              autoFocus
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search pages…"
              className="h-11 flex-1 bg-transparent text-sm text-ink-primary outline-none placeholder:text-ink-secondary"
            />
          </div>

          <div className="max-h-80 overflow-y-auto p-1.5">
            {results.length === 0 ? (
              <div className="px-3 py-8 text-center text-sec text-ink-secondary">
                No results for “{query}”.
              </div>
            ) : (
              results.map((cmd, i) => {
                const Icon = NAV_ICONS[cmd.icon];
                const active = i === activeIndex;
                return (
                  <button
                    key={`${cmd.href}-${cmd.label}`}
                    type="button"
                    onClick={() => select(cmd)}
                    onMouseMove={() => setActiveIndex(i)}
                    data-active={active || undefined}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sec text-ink-secondary transition-colors",
                      active && "bg-accent text-accent-foreground",
                    )}
                  >
                    {Icon ? (
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
                          active ? "text-accent-foreground" : "text-ink-secondary",
                        )}
                      />
                    ) : null}
                    <span className="flex-1 truncate">{cmd.label}</span>
                    <span className="text-micro text-ink-secondary">{cmd.section}</span>
                    {active && (
                      <CornerDownLeftIcon className="size-3.5 shrink-0 text-ink-secondary" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
