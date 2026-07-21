"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  assignSupportRequest,
  escalateSupportRequest,
  getSupportQueue,
  getSupportRequest,
  resolveSupportRequest,
} from "@/lib/api/supportApi";
import { useToast } from "@/hooks/useToast";

/**
 * SLA timers run in real time, so the queue refreshes on its own — an operator
 * should never be looking at a breach that already happened five minutes ago.
 */
const QUEUE_POLL_MS = 30_000;

export function useSupportQueue(clientId?: string) {
  return useQuery({
    queryKey: ["support-queue", clientId ?? "all"],
    queryFn: () => getSupportQueue(clientId),
    refetchInterval: QUEUE_POLL_MS,
  });
}

export function useSupportRequest(requestId: string) {
  return useQuery({
    queryKey: ["support-request", requestId],
    queryFn: () => getSupportRequest(requestId),
    enabled: Boolean(requestId),
  });
}

/**
 * Assign / escalate / resolve.
 *
 * Every one of these invalidates the CUSTOMER caches as well as the support
 * ones, because a blocking request is an input to customer health and to the
 * customer-first suppression rule. Resolving the last blocking issue is
 * precisely the moment a commercial action becomes eligible again, and the
 * cockpit has to notice.
 */
export function useSupportActions(requestId: string) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["support-request", requestId] });
    qc.invalidateQueries({ queryKey: ["support-queue"] });
    qc.invalidateQueries({ queryKey: ["customers"] });
    qc.invalidateQueries({ queryKey: ["customer"] });
    qc.invalidateQueries({ queryKey: ["customer-next-action"] });
  };

  const assign = useMutation({
    mutationFn: (owner: string) => assignSupportRequest(requestId, owner),
    onSuccess: () => {
      invalidate();
      toast.success("Assigned.");
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const escalate = useMutation({
    mutationFn: (reason: string) => escalateSupportRequest(requestId, reason),
    onSuccess: () => {
      invalidate();
      toast.success("Escalated — commercial actions are now suppressed for this customer.");
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const resolve = useMutation({
    mutationFn: (resolution: string) => resolveSupportRequest(requestId, resolution),
    onSuccess: () => {
      invalidate();
      toast.success("Resolved. The customer will be asked whether it actually helped.");
    },
    onError: (e) => toast.error((e as Error).message),
  });

  return { assign, escalate, resolve };
}
