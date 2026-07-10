"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { advanceJourney, getJourney, getJourneyOverview } from "@/lib/api/journeyApi";
import { useToast } from "@/hooks/useToast";
import { JOURNEY_STATE_LABEL, type JourneyEvent } from "@/constants/journeyStates";

/** The journey read for a lead. */
export function useJourney(leadId: string) {
  return useQuery({
    queryKey: ["journey", leadId],
    queryFn: () => getJourney(leadId),
    enabled: Boolean(leadId),
  });
}

/** Distribution of leads across journey states (overview widget). */
export function useJourneyOverview() {
  return useQuery({ queryKey: ["journey-overview"], queryFn: getJourneyOverview });
}

/** Manual guarded advance; refreshes the journey + lead caches on success. */
export function useAdvanceJourney(leadId: string) {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (vars: { event: JourneyEvent; meta?: Record<string, unknown> }) =>
      advanceJourney(leadId, vars.event, vars.meta),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["journey", leadId] });
      qc.invalidateQueries({ queryKey: ["lead", leadId] });
      qc.invalidateQueries({ queryKey: ["leads"] });
      // The cockpit's state + next-best-action are derived from the journey, and
      // the overview distribution counts it — refresh all three.
      qc.invalidateQueries({ queryKey: ["cockpit", leadId] });
      qc.invalidateQueries({ queryKey: ["cockpit-nba", leadId] });
      qc.invalidateQueries({ queryKey: ["journey-overview"] });
      toast.success(
        res.changed
          ? `Advanced to ${JOURNEY_STATE_LABEL[res.toState]}`
          : "Already in that state",
      );
    },
    onError: (e) => toast.error((e as Error).message),
  });
}
