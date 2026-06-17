import { SidebarLink } from "@/components/layout/SidebarLink";
import type { NavSection } from "@/config/navigation.config";

export function SidebarSection({ section }: { section: NavSection }) {
  return (
    <div className="space-y-0.5">
      {section.label && (
        <div className="px-3 pt-4 pb-1 text-micro font-semibold uppercase tracking-[0.08em] text-oni-muted/70">
          {section.label}
        </div>
      )}
      {section.items.map((item) => (
        <SidebarLink key={item.href} item={item} />
      ))}
    </div>
  );
}
