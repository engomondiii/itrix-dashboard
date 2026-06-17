import Link from "next/link";
import { BellIcon, ClockIcon, UserIcon, UsersIcon, type LucideIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { ROUTES } from "@/constants/routes";

const ITEMS: { href: string; title: string; desc: string; icon: LucideIcon }[] = [
  { href: ROUTES.settingsTeam, title: "Team", desc: "Members and roles", icon: UsersIcon },
  { href: ROUTES.settingsSla, title: "SLA", desc: "Response thresholds", icon: ClockIcon },
  { href: ROUTES.settingsNotifications, title: "Notifications", desc: "Alert preferences", icon: BellIcon },
  { href: ROUTES.settingsProfile, title: "Profile", desc: "Your account", icon: UserIcon },
];

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Team, SLA, notifications, and profile." />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ITEMS.map(({ href, title, desc, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-md border border-line bg-surface p-4 shadow-1 transition-colors hover:border-sapphire-300"
          >
            <span className="flex size-9 items-center justify-center rounded-md bg-surface-sunken">
              <Icon className="size-4 text-ink-500" />
            </span>
            <div>
              <div className="text-card-title font-semibold text-ink-900">{title}</div>
              <div className="text-caption text-ink-400">{desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
