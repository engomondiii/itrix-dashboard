"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRightIcon } from "lucide-react";

import { NAV_ICONS } from "@/components/layout/nav-icons";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import type { NavItem } from "@/config/navigation.config";
import { ROUTES } from "@/constants/routes";

function isHrefActive(pathname: string, href: string) {
  // Exact match for the overview root; prefix match for sections with children.
  if (href === ROUTES.overview) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** A single sidebar entry — a leaf link or a collapsible group of links. */
export function SidebarNavItem({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const Icon = NAV_ICONS[item.icon];

  if (item.children?.length) {
    const childActive = item.children.some((c) => isHrefActive(pathname, c.href));
    const groupActive = isHrefActive(pathname, item.href) || childActive;

    return (
      <Collapsible defaultOpen={groupActive} className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger
            render={
              <SidebarMenuButton isActive={groupActive}>
                {Icon ? <Icon /> : null}
                <span>{item.label}</span>
                <ChevronRightIcon className="ml-auto size-4 shrink-0 text-ink-muted transition-transform duration-200 group-data-[panel-open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            }
          />
          <CollapsibleContent>
            <SidebarMenuSub>
              {/*
                The trigger opens the group; it does not navigate. Without this
                first entry the parent's own page is unreachable from the
                sidebar — /follow-up, /analytics, /templates and /settings all
                have real pages that nothing linked to.

                A trigger that both toggled and navigated would be the other
                option, and a worse one: it makes the disclosure arrow
                unpredictable, and every accidental expand becomes a page load.
              */}
              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  isActive={pathname === item.href}
                  render={<Link href={item.href} />}
                >
                  <span>All {item.label.toLowerCase()}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              {item.children.map((child) => {
                const ChildIcon = NAV_ICONS[child.icon];
                return (
                  <SidebarMenuSubItem key={child.href}>
                    <SidebarMenuSubButton
                      isActive={isHrefActive(pathname, child.href)}
                      render={<Link href={child.href} />}
                    >
                      {ChildIcon ? <ChildIcon /> : null}
                      <span>{child.label}</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                );
              })}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isHrefActive(pathname, item.href)}
        tooltip={item.label}
        render={<Link href={item.href} />}
      >
        {Icon ? <Icon /> : null}
        <span>{item.label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
