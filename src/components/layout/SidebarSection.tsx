import { SidebarNavItem } from "@/components/layout/SidebarLink";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import type { NavSection } from "@/config/navigation.config";

export function SidebarSection({ section }: { section: NavSection }) {
  return (
    <SidebarGroup>
      {section.label && <SidebarGroupLabel>{section.label}</SidebarGroupLabel>}
      <SidebarMenu>
        {section.items.map((item) => (
          <SidebarNavItem key={item.href} item={item} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
