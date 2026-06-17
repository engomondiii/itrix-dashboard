import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/settings/RoleBadge";
import type { TeamMember } from "@/types/team";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-line bg-surface p-3 shadow-1">
      <Avatar className="size-9">
        <AvatarFallback className="bg-sapphire-100 text-caption font-semibold text-sapphire-700">
          {initials(member.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="truncate text-sec font-medium text-ink-900">{member.name}</div>
        <div className="truncate text-caption text-ink-400">{member.email}</div>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-3">
        {member.openLeads != null && (
          <span className="text-caption tabular-nums text-ink-500">
            {member.openLeads} open
          </span>
        )}
        <RoleBadge role={member.role} />
      </div>
    </div>
  );
}
