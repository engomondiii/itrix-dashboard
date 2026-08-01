import Image from "next/image";
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
          {/* The brand X letterform (reversed cut) on the dark tile — the supplied
              asset, not a typed capital X, so the mark matches the wordmark. */}
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-ink-primary">
            <Image
              src="/brand/itrix-x-inverse.png"
              alt=""
              aria-hidden="true"
              width={14}
              height={17}
              unoptimized
            />
          </span>
          <span className="flex items-center gap-1.5 group-data-[collapsible=icon]:hidden">
            {/* The itriX wordmark asset (reversed cut, for the dark sidebar). Its own
                alt carries the brand name for screen readers. */}
            <Image
              src="/brand/itrix-logo-inverse.png"
              alt="itriX"
              width={44}
              height={20}
              unoptimized
            />
            <span className="text-micro font-medium uppercase tracking-[0.1em] text-ink-muted">
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
