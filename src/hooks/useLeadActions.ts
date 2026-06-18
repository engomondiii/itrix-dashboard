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

/** Mutations for a single lead; refresh the detail + list caches on success. */
export function useLeadActions(id: string) {
  const qc = useQueryClient();
  const { toast } = useToast();

  function onSuccess(lead: Lead, message: string) {
    qc.setQueryData(["lead", id], lead);
    qc.invalidateQueries({ queryKey: ["leads"] });
    toast.success(message);
  }
  function onError(e: unknown) {
    toast.error((e as Error).message);
  }

  return {
    assign: useMutation({
      mutationFn: (vars: { owner: string | null; note?: string }) =>
        assignOwner(id, vars.owner, vars.note),
      onSuccess: (l) => onSuccess(l, "Owner updated"),
      onError,
    }),
    setStatus: useMutation({
      mutationFn: (vars: { status: LeadStatus; reason?: string }) =>
        setLeadStatus(id, vars.status, vars.reason),
      onSuccess: (l) => onSuccess(l, "Status updated"),
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
      onSuccess: (l) => onSuccess(l, "Marked NDA required"),
      onError,
    }),
    requestEvaluation: useMutation({
      mutationFn: (input: RequestEvaluationInput) => requestLeadEvaluation(id, input),
      onSuccess: (l) => onSuccess(l, "Paid evaluation opened"),
      onError,
    }),
    markPoC: useMutation({
      mutationFn: (input: MarkPoCInput) => markLeadPoC(id, input),
      onSuccess: (l) => onSuccess(l, "PoC opened"),
      onError,
    }),
    bookMeeting: useMutation({
      mutationFn: (input: BookMeetingInput) => bookLeadMeeting(id, input),
      onSuccess: (l) => onSuccess(l, "Meeting booked"),
      onError,
    }),
  };
}
