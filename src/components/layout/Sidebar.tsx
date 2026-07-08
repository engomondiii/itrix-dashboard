import Link from "next/link";

import { SidebarSection } from "@/components/layout/SidebarSection";
import {
  Sidebar as SidebarShell,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { navigation } from "@/config/navigation.config";
import { ROUTES } from "@/constants/routes";

export function Sidebar() {
  return (
    <SidebarShell collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link
          href={ROUTES.overview}
          className="flex h-9 items-center gap-2 rounded-md px-1.5 outline-none ring-sidebar-ring focus-visible:ring-2"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-sapphire-600 text-card-title font-bold text-white">
            X
          </span>
          <span className="flex items-baseline gap-1 group-data-[collapsible=icon]:hidden">
            <span className="text-section font-semibold tracking-tight">
              itriX
            </span>
            <span className="text-micro font-medium uppercase tracking-[0.1em] text-oni-muted">
              Ops
            </span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="nav-scroll">
        {navigation.map((section, i) => (
          <SidebarSection key={section.label ?? `top-${i}`} section={section} />
        ))}
      </SidebarContent>

      <SidebarRail />
    </SidebarShell>
  );
}
