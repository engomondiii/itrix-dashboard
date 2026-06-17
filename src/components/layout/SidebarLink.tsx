"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ICONS } from "@/components/layout/nav-icons";
import type { NavItem } from "@/config/navigation.config";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export function SidebarLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const Icon = NAV_ICONS[item.icon];

  // Exact match for the overview root; prefix match for sections with children.
  const active =
    item.href === ROUTES.overview
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      data-active={active}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sec transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-foreground"
          : "text-oni-muted hover:bg-indigo-900 hover:text-sidebar-foreground",
      )}
    >
      {active && (
        <span className="absolute top-1 bottom-1 left-0 w-[3px] rounded-full bg-sidebar-ring" />
      )}
      {Icon && (
        <Icon
          className={cn(
            "size-4 shrink-0",
            active ? "text-sapphire-300" : "text-oni-muted group-hover:text-sidebar-foreground",
          )}
        />
      )}
      <span className="truncate">{item.label}</span>
    </Link>
  );
}
