"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import {
  getCockpit,
  getNextAction,
  getPitchAnalytics,
  runAgent,
} from "@/lib/api/cockpitApi";
import { useToast } from "@/hooks/useToast";
import type { AgentRunResult } from "@/types/agent";

export function usePitchAnalytics(days?: number) {
  return useQuery({
    queryKey: ["pitch-analytics", days ?? 30],
    queryFn: () => getPitchAnalytics(days),
  });
}

export function useCockpit(leadId: string) {
  return useQuery({
    queryKey: ["cockpit", leadId],
    queryFn: () => getCockpit(leadId),
    enabled: Boolean(leadId),
  });
}

export function useNextAction(leadId: string) {
  return useQuery({
    queryKey: ["cockpit-nba", leadId],
    queryFn: () => getNextAction(leadId),
    enabled: Boolean(leadId),
  });
}

export function useRunAgent(leadId: string) {
  const { toast } = useToast();
  return useMutation({
    mutationFn: (key: string) => runAgent(key, leadId),
    onSuccess: (r: AgentRunResult) =>
      toast.success(
        r.governanceStatus === "under_review" || r.governanceStatus === "pending"
          ? `${r.agentKey} draft queued for approval`
          : `${r.agentKey} draft ready`,
      ),
    onError: (e) => toast.error((e as Error).message),
  });
}
