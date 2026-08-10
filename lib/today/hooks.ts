'use client';

/**
 * TanStack Query hooks for the Today queue.
 *
 * Everything polls at 30s — the deliberate REST-polling stance (realtime WS
 * does not exist on this backend). Mutations invalidate their own domain key
 * only; the bands are independent queries so one slow domain never blocks
 * the others.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ApprovalAction } from './types';
import {
  actOnApproval,
  actOnAttachment,
  assignLead,
  completeFollowUp,
  dismissFollowUp,
  getSupportQueue,
  listApprovalQueue,
  listAttachmentQueue,
  listFollowUp,
  listNda,
  listNewLeads,
  listThreads,
  snoozeFollowUp,
  type FollowUpScope,
} from './api';

const POLL_MS = 30_000;

export const TODAY_KEYS = {
  approvals: ['today', 'approvals'] as const,
  followUp: (scope: FollowUpScope) => ['today', 'follow-up', scope] as const,
  followUpAll: ['today', 'follow-up'] as const,
  threads: ['today', 'threads'] as const,
  newLeads: ['today', 'leads', 'new'] as const,
  nda: ['today', 'nda'] as const,
  support: ['today', 'support'] as const,
  attachments: ['today', 'attachments'] as const,
};

// -- Queries -----------------------------------------------------------------

export function useApprovalQueue() {
  return useQuery({
    queryKey: TODAY_KEYS.approvals,
    queryFn: listApprovalQueue,
    refetchInterval: POLL_MS,
  });
}

export function useFollowUp(scope: FollowUpScope) {
  return useQuery({
    queryKey: TODAY_KEYS.followUp(scope),
    queryFn: () => listFollowUp(scope),
    refetchInterval: POLL_MS,
  });
}

export function useThreadBoard() {
  return useQuery({
    queryKey: TODAY_KEYS.threads,
    queryFn: () => listThreads(),
    refetchInterval: POLL_MS,
  });
}

export function useNewLeads() {
  return useQuery({
    queryKey: TODAY_KEYS.newLeads,
    queryFn: listNewLeads,
    refetchInterval: POLL_MS,
  });
}

/** NDAs in flight = required (to send) + sent (awaiting signature). */
export function useNdaInFlight() {
  return useQuery({
    queryKey: TODAY_KEYS.nda,
    queryFn: async () => {
      const [required, sent] = await Promise.all([listNda('required'), listNda('sent')]);
      return { results: [...required.results, ...sent.results] };
    },
    refetchInterval: POLL_MS,
  });
}

export function useSupportQueue() {
  return useQuery({
    queryKey: TODAY_KEYS.support,
    queryFn: getSupportQueue,
    refetchInterval: POLL_MS,
  });
}

export function useAttachmentQueue() {
  return useQuery({
    queryKey: TODAY_KEYS.attachments,
    queryFn: listAttachmentQueue,
    refetchInterval: POLL_MS,
  });
}

// -- Mutations ---------------------------------------------------------------

export function useApprovalAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
      body,
      reason,
    }: {
      id: string;
      action: ApprovalAction;
      body?: string;
      reason?: string;
    }) => actOnApproval(id, action, { body, reason }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TODAY_KEYS.approvals }),
  });
}

export function useFollowUpAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
      hours,
    }: {
      id: string;
      action: 'complete' | 'snooze' | 'dismiss';
      hours?: number;
    }) => {
      if (action === 'complete') return completeFollowUp(id);
      if (action === 'snooze') return snoozeFollowUp(id, hours);
      return dismissFollowUp(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TODAY_KEYS.followUpAll }),
  });
}

export function useTakeLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, owner }: { id: string; owner: string }) => assignLead(id, owner),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TODAY_KEYS.newLeads }),
  });
}

export function useAttachmentAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
      reason,
    }: {
      id: string;
      action: 'release' | 'quarantine';
      reason: string;
    }) => actOnAttachment(id, action, reason),
    // The action response is a small ack, not a row — refetch is mandatory.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TODAY_KEYS.attachments }),
  });
}
