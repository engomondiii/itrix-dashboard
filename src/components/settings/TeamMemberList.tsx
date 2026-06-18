"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";

import { TeamMemberCard } from "@/components/settings/TeamMemberCard";
import { TeamMemberFormDialog } from "@/components/settings/TeamMemberFormDialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTeam } from "@/hooks/useTeam";

export function TeamMemberList() {
  const { data, isLoading } = useTeam();
  const [inviting, setInviting] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setInviting(true)}>
          <PlusIcon />
          Invite member
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="size-5" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {(data?.results ?? []).map((m) => (
            <TeamMemberCard key={m.id} member={m} />
          ))}
        </div>
      )}

      {inviting && <TeamMemberFormDialog onClose={() => setInviting(false)} />}
    </div>
  );
}
