"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getThread, listConversations, sendTeamMessage } from "@/lib/api/consoleApi";
import { useToast } from "@/hooks/useToast";
import { dashboardConfig } from "@/config/dashboard.config";
import { REALTIME_ENABLED } from "@/lib/realtime/config";

export function useConversations() {
  return useQuery({ queryKey: ["conversations"], queryFn: listConversations });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: ["conversation", id],
    queryFn: () => getThread(id),
    enabled: Boolean(id),
    // Until realtime is on, poll the open thread so new messages appear.
    refetchInterval: REALTIME_ENABLED ? false : dashboardConfig.polling.console,
  });
}

export function useSendTeamMessage(id: string) {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (v: { body: string; claimLevel?: number }) =>
      sendTeamMessage(id, v.body, v.claimLevel),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["conversation", id] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
      const held = r.governanceStatus === "under_review" || r.governanceStatus === "pending";
      toast.success(
        held
          ? "Held for review — a human must approve before it reaches the client"
          : "Message delivered",
      );
    },
    onError: (e) => toast.error((e as Error).message),
  });
}
