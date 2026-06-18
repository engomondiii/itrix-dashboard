"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  completeFollowUp,
  dismissFollowUp,
  listFollowUp,
  rescheduleFollowUp,
  snoozeFollowUp,
  type FollowUpFilter,
} from "@/lib/api/followUpApi";
import { dashboardConfig } from "@/config/dashboard.config";
import { useToast } from "@/hooks/useToast";

export function useFollowUpQueue(filter?: FollowUpFilter) {
  return useQuery({
    queryKey: ["follow-up", filter ?? "all"],
    queryFn: () => listFollowUp(filter),
    refetchInterval: dashboardConfig.polling.followUp,
  });
}

export function useFollowUpActions() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["follow-up"] });

  return {
    complete: useMutation({
      mutationFn: (id: string) => completeFollowUp(id),
      onSuccess: () => {
        invalidate();
        toast.success("Follow-up completed");
      },
      onError: (e) => toast.error((e as Error).message),
    }),
    snooze: useMutation({
      mutationFn: (id: string) => snoozeFollowUp(id, 24),
      onSuccess: () => {
        invalidate();
        toast.success("Snoozed 24h");
      },
      onError: (e) => toast.error((e as Error).message),
    }),
    dismiss: useMutation({
      mutationFn: (id: string) => dismissFollowUp(id),
      onSuccess: () => {
        invalidate();
        toast.success("Follow-up dismissed");
      },
      onError: (e) => toast.error((e as Error).message),
    }),
    reschedule: useMutation({
      mutationFn: ({ id, dueAt }: { id: string; dueAt: string }) =>
        rescheduleFollowUp(id, dueAt),
      onSuccess: () => {
        invalidate();
        toast.success("Follow-up rescheduled");
      },
      onError: (e) => toast.error((e as Error).message),
    }),
  };
}
