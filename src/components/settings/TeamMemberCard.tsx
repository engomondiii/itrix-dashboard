"use client";

import { useState } from "react";
import { MoreVerticalIcon, PencilIcon, Trash2Icon } from "lucide-react";

import { RoleBadge } from "@/components/settings/RoleBadge";
import { TeamMemberFormDialog } from "@/components/settings/TeamMemberFormDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTeamActions } from "@/hooks/useTeam";
import type { TeamMember } from "@/types/team";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function TeamMemberCard({ member }: { member: TeamMember }) {
  const { remove } = useTeamActions();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex items-center gap-3 rounded-md border border-line bg-surface p-3 shadow-1">
      <Avatar className="size-9">
        <AvatarFallback className="bg-sapphire-100 text-caption font-semibold text-sapphire-700">
          {initials(member.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="truncate text-sec font-medium text-ink-900">
          {member.name}
        </div>
        <div className="truncate text-caption text-ink-400">{member.email}</div>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-3">
        {member.openLeads != null && (
          <span className="text-caption tabular-nums text-ink-500">
            {member.openLeads} open
          </span>
        )}
        <RoleBadge role={member.role} />
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Member actions"
            className="inline-flex size-7 items-center justify-center rounded-md text-ink-400 outline-none hover:bg-muted hover:text-ink-700 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <MoreVerticalIcon className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditing(true)}>
              <PencilIcon />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setConfirming(true)}
            >
              <Trash2Icon />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {editing && (
        <TeamMemberFormDialog member={member} onClose={() => setEditing(false)} />
      )}
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Remove team member?"
        description={`${member.name} will lose dashboard access. This cannot be undone.`}
        confirmLabel="Remove"
        destructive
        loading={remove.isPending}
        onConfirm={() =>
          remove.mutate(member.id, { onSuccess: () => setConfirming(false) })
        }
      />
    </div>
  );
}
