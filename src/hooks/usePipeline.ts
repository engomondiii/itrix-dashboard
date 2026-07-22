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

/**
 * Move a lead to a different pipeline stage (status change).
 *
 * The move menu targets any `LEAD_STATUSES` value, including NDA. The **NDA
 * list** is derived from status — `listNda` selects leads whose status is in
 * `["NDA","Evaluation","PoC","Licensed"]` — so a move is not purely a pipeline
 * event: it changes what that screen contains. Without refreshing it, moving a
 * card into the NDA column left the NDA screen stale for its 30s window.
 *
 * DELIBERATELY NOT invalidating `["evaluations"]` / `["pocs"]`. Those screens
 * list Evaluation and PoC *records* (`evalDb()` / `pocDb()`), not leads filtered
 * by status — only the dedicated "Request paid evaluation" / "Mark PoC
 * candidate" actions create one, and `useLeadActions` refreshes them there. A
 * status move to PoC creates no PoC, which was confirmed against the runtime
 * before this comment was written: after moving a lead to PoC its pipeline
 * column changed and the PoCs screen did not.
 */
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
      // NDA-list membership is derived from lead.status.
      qc.invalidateQueries({ queryKey: ["nda"] });
      toast.success(`Moved to ${lead.status}`);
    },
    onError: (e) => toast.error((e as Error).message),
  });
}
