"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  addLeadNote,
  assignOwner,
  bookLeadMeeting,
  escalateLead,
  markLeadNda,
  markLeadPoC,
  requestLeadEvaluation,
  setLeadStatus,
  type BookMeetingInput,
  type EscalateInput,
  type MarkPoCInput,
  type RequestEvaluationInput,
} from "@/lib/api/leadsApi";
import { useToast } from "@/hooks/useToast";
import type { LeadStatus } from "@/constants/statuses";
import type { Lead } from "@/types/lead";

/**
 * Mutations for a single lead.
 *
 * REFRESHING ONLY THE LEAD IS NOT ENOUGH. Four of these actions move
 * `lead.status`, and status is what the **pipeline board** groups by and what the
 * **NDA list** filters on — `listNda` selects leads whose status is in
 * `NDA_LEAD_STATUSES`. Two more create a deal record that its own screen lists.
 * With a 30s `staleTime`, invalidating only `["lead"]` and `["leads"]` meant an
 * operator who marked a lead NDA-required and then opened Pipeline saw it still
 * sitting in its old column.
 *
 * Extra keys are declared PER ACTION rather than invalidated wholesale, so a
 * note or an escalation — both of which are lead-local — do not needlessly
 * refetch the whole board. `useAdvanceJourney` follows the same shape.
 */
type CacheKey = readonly unknown[];

/** Status drives the pipeline columns and NDA-list membership. */
const STATUS_DEPENDENTS: CacheKey[] = [["pipeline"], ["nda"]];

export function useLeadActions(id: string) {
  const qc = useQueryClient();
  const { toast } = useToast();

  function onSuccess(lead: Lead, message: string, alsoInvalidate: CacheKey[] = []) {
    qc.setQueryData(["lead", id], lead);
    qc.invalidateQueries({ queryKey: ["leads"] });
    for (const queryKey of alsoInvalidate) qc.invalidateQueries({ queryKey });
    toast.success(message);
  }
  function onError(e: unknown) {
    toast.error((e as Error).message);
  }

  return {
    assign: useMutation({
      mutationFn: (vars: { owner: string | null; note?: string }) =>
        assignOwner(id, vars.owner, vars.note),
      onSuccess: (l) => onSuccess(l, "Owner updated", [["pipeline"]]),
      onError,
    }),
    setStatus: useMutation({
      mutationFn: (vars: { status: LeadStatus; reason?: string }) =>
        setLeadStatus(id, vars.status, vars.reason),
      onSuccess: (l) => onSuccess(l, "Status updated", STATUS_DEPENDENTS),
      onError,
    }),
    addNote: useMutation({
      mutationFn: (body: string) => addLeadNote(id, body),
      onSuccess: (l) => onSuccess(l, "Note added"),
      onError,
    }),
    escalate: useMutation({
      mutationFn: (input: EscalateInput) => escalateLead(id, input),
      onSuccess: (l) => onSuccess(l, "Escalated to executive review"),
      onError,
    }),
    markNda: useMutation({
      mutationFn: () => markLeadNda(id),
      onSuccess: (l) => onSuccess(l, "Marked NDA required", STATUS_DEPENDENTS),
      onError,
    }),
    requestEvaluation: useMutation({
      mutationFn: (input: RequestEvaluationInput) => requestLeadEvaluation(id, input),
      onSuccess: (l) =>
        onSuccess(l, "Paid evaluation opened", [...STATUS_DEPENDENTS, ["evaluations"]]),
      onError,
    }),
    markPoC: useMutation({
      mutationFn: (input: MarkPoCInput) => markLeadPoC(id, input),
      onSuccess: (l) => onSuccess(l, "PoC opened", [...STATUS_DEPENDENTS, ["pocs"]]),
      onError,
    }),
    bookMeeting: useMutation({
      mutationFn: (input: BookMeetingInput) => bookLeadMeeting(id, input),
      onSuccess: (l) => onSuccess(l, "Meeting booked"),
      onError,
    }),
  };
}
