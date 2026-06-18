"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  inviteTeamMember,
  listTeam,
  removeTeamMember,
  updateTeamMember,
  type TeamMemberInput,
  type TeamMemberPatch,
} from "@/lib/api/settingsApi";
import { useToast } from "@/hooks/useToast";

export function useTeam() {
  return useQuery({ queryKey: ["team"], queryFn: listTeam });
}

/** Invite / update / remove team members; refresh the roster on success. */
export function useTeamActions() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["team"] });
  const onError = (e: unknown) => toast.error((e as Error).message);

  return {
    invite: useMutation({
      mutationFn: (input: TeamMemberInput) => inviteTeamMember(input),
      onSuccess: () => {
        invalidate();
        toast.success("Member invited");
      },
      onError,
    }),
    update: useMutation({
      mutationFn: (vars: { id: string; patch: TeamMemberPatch }) =>
        updateTeamMember(vars.id, vars.patch),
      onSuccess: () => {
        invalidate();
        toast.success("Member updated");
      },
      onError,
    }),
    remove: useMutation({
      mutationFn: (id: string) => removeTeamMember(id),
      onSuccess: () => {
        invalidate();
        toast.success("Member removed");
      },
      onError,
    }),
  };
}
