import Link from "next/link";

import { SidebarSection } from "@/components/layout/SidebarSection";
import { navigation } from "@/config/navigation.config";
import { ROUTES } from "@/constants/routes";

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
      {/* Brand */}
      <Link
        href={ROUTES.overview}
        className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4 text-section font-semibold tracking-tight"
      >
        itri<span className="text-sapphire-300">X</span>
        <span className="text-micro font-medium uppercase tracking-[0.1em] text-oni-muted">
          Ops
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {navigation.map((section, i) => (
          <SidebarSection key={section.label ?? `top-${i}`} section={section} />
        ))}
      </nav>
    </aside>
  );
}
