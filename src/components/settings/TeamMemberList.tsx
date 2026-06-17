"use client";

import { TeamMemberCard } from "@/components/settings/TeamMemberCard";
import { Spinner } from "@/components/ui/spinner";
import { useTeam } from "@/hooks/useTeam";

export function TeamMemberList() {
  const { data, isLoading } = useTeam();
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="size-5" />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {(data?.results ?? []).map((m) => (
        <TeamMemberCard key={m.id} member={m} />
      ))}
    </div>
  );
}
