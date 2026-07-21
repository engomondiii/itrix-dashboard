"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  advanceJourney,
  getJourney,
  getJourneyMigrationReport,
  getJourneyOverview,
} from "@/lib/api/journeyApi";
import { useToast } from "@/hooks/useToast";
import { JOURNEY_STATE_LABEL, type JourneyEvent } from "@/constants/journeyStates";

/** The journey read for a lead — state, reveals, shell contract and history. */
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

/**
 * The ENGAGED-split dry run. A proposal about data that has not changed, so it
 * does not need to be fresh — it is reviewed once and then the migration is
 * applied out of band.
 */
export function useJourneyMigrationReport() {
  return useQuery({
    queryKey: ["journey-migration-report"],
    queryFn: getJourneyMigrationReport,
    staleTime: 5 * 60_000,
  });
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
      // `changed: false` is not a no-op — a self-transition such as `nda_signed`
      // reveals in place (the ceiling rises, the data room opens) without moving
      // the subject. Saying "already in that state" would misreport a real event.
      toast.success(
        res.changed
          ? `Advanced to ${JOURNEY_STATE_LABEL[res.toState]}`
          : `Recorded — ${JOURNEY_STATE_LABEL[res.toState]} unchanged`,
      );
    },
    onError: (e) => toast.error((e as Error).message),
  });
}
