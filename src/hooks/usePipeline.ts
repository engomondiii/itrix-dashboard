"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getPipeline } from "@/lib/api/pipelineApi";
import { setLeadStatus } from "@/lib/api/leadsApi";
import { dashboardConfig } from "@/config/dashboard.config";
import { useToast } from "@/hooks/useToast";
import type { LeadStatus } from "@/constants/statuses";

export function usePipeline() {
  return useQuery({
    queryKey: ["pipeline"],
    queryFn: getPipeline,
    refetchInterval: dashboardConfig.polling.overview,
  });
}

/** Move a lead to a different pipeline stage (status change). */
export function useMoveLead() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (vars: { leadId: string; status: LeadStatus }) =>
      setLeadStatus(vars.leadId, vars.status),
    onSuccess: (lead) => {
      qc.setQueryData(["lead", lead.id], lead);
      qc.invalidateQueries({ queryKey: ["pipeline"] });
      qc.invalidateQueries({ queryKey: ["leads"] });
      toast.success(`Moved to ${lead.status}`);
    },
    onError: (e) => toast.error((e as Error).message),
  });
}
