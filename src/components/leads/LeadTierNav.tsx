import Link from "next/link";

import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { TIERS, type Tier } from "@/constants/tiers";

/**
 * Tab bar across the leads views: All leads + one tab per tier.
 * `current` is the locked tier of the active view (undefined = All leads).
 */
export function LeadTierNav({ current }: { current?: Tier }) {
  const tabs = [
    { label: "All leads", href: ROUTES.leads, active: current == null },
    ...TIERS.map((t) => ({
      label: `Tier ${t}`,
      href: ROUTES.leadsTier(t),
      active: current === t,
    })),
  ];

  return (
    <nav className="flex items-center gap-1 border-b border-border-soft" aria-label="Lead tiers">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          aria-current={t.active ? "page" : undefined}
          className={cn(
            "relative px-3 py-2 text-sec font-medium transition-colors",
            t.active ? "text-ink-primary" : "text-ink-secondary hover:text-ink-secondary",
          )}
        >
          {t.label}
          {t.active && (
            <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-signature" />
          )}
        </Link>
      ))}
    </nav>
  );
}
