'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { normalizeError } from '@/lib/api/errors';
import type { LeadStatus } from '@/lib/today/types';
import {
  addLeadNote,
  bookLeadMeeting,
  declineNda,
  getDealSignals,
  getLead,
  getNdaRecord,
  getNextAction,
  getPipeline,
  listLeads,
  prepareNda,
  requestNda,
  sendNda,
  setLeadStatus,
  signNda,
  type LeadListParams,
} from './api';
import { assignLead } from '@/lib/today/api';
import type { LeadDetail, NdaRecord } from './types';

const LEAD_KEYS = {
  list: (params: LeadListParams) => ['leads', 'list', params] as const,
  pipeline: ['leads', 'pipeline'] as const,
  detail: (id: string) => ['leads', 'detail', id] as const,
  signals: (id: string) => ['leads', 'signals', id] as const,
  nextAction: (id: string) => ['leads', 'next-action', id] as const,
  nda: (id: string) => ['leads', 'nda', id] as const,
};

export function useLeads(params: LeadListParams) {
  return useQuery({
    queryKey: LEAD_KEYS.list(params),
    queryFn: () => listLeads(params),
    // Keep the previous page on screen while a filter change loads — a
    // flashing empty table reads as data loss.
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
  });
}

export function usePipeline(enabled = true) {
  return useQuery({
    queryKey: LEAD_KEYS.pipeline,
    queryFn: getPipeline,
    enabled,
    refetchInterval: 30_000,
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: LEAD_KEYS.detail(id),
    queryFn: () => getLead(id),
  });
}

export function useDealSignals(id: string) {
  return useQuery({
    queryKey: LEAD_KEYS.signals(id),
    queryFn: () => getDealSignals(id),
  });
}

export function useNextAction(id: string) {
  return useQuery({
    queryKey: LEAD_KEYS.nextAction(id),
    queryFn: () => getNextAction(id),
  });
}

/** null = no NDA record yet (backend 404s; nothing is auto-created). */
export function useNdaRecord(leadId: string) {
  return useQuery({
    queryKey: LEAD_KEYS.nda(leadId),
    queryFn: async (): Promise<NdaRecord | null> => {
      try {
        return await getNdaRecord(leadId);
      } catch (error) {
        if (normalizeError(error).status === 404) return null;
        throw error;
      }
    },
  });
}

/**
 * Every lead action returns the FULL detail body — write it into the cache
 * directly and invalidate the surrounding lists.
 */
function useLeadDetailMutation<TVars>(
  id: string,
  mutationFn: (vars: TVars) => Promise<LeadDetail>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (detail) => {
      queryClient.setQueryData(LEAD_KEYS.detail(id), detail);
      queryClient.invalidateQueries({ queryKey: ['leads', 'list'] });
      queryClient.invalidateQueries({ queryKey: LEAD_KEYS.pipeline });
      queryClient.invalidateQueries({ queryKey: ['today'] });
    },
  });
}

export function useAddNote(id: string) {
  return useLeadDetailMutation(id, (body: string) => addLeadNote(id, body));
}

export function useSetStatus(id: string) {
  return useLeadDetailMutation(id, (status: LeadStatus) => setLeadStatus(id, status));
}

export function useBookMeeting(id: string) {
  return useLeadDetailMutation(
    id,
    (meeting: { scheduledAt: string; durationMins?: number; attendee?: string; location?: string; notes?: string }) =>
      bookLeadMeeting(id, meeting),
  );
}

export function useAssignLead(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    // Assign returns the detail shape too, but type it loosely and refetch —
    // the response type isn't guaranteed by the serializer split.
    mutationFn: (owner: string | null) => assignLead(id, owner),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAD_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['leads', 'list'] });
      queryClient.invalidateQueries({ queryKey: LEAD_KEYS.pipeline });
    },
  });
}

export function useRequestNda(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => requestNda(id),
    onSuccess: (detail) => {
      queryClient.setQueryData(LEAD_KEYS.detail(id), detail);
      // The action also creates the NDARecord — refresh the panel and lists.
      queryClient.invalidateQueries({ queryKey: LEAD_KEYS.nda(id) });
      queryClient.invalidateQueries({ queryKey: ['leads', 'list'] });
      queryClient.invalidateQueries({ queryKey: LEAD_KEYS.pipeline });
      queryClient.invalidateQueries({ queryKey: ['today'] });
    },
  });
}

/** NDA panel actions all return the full NDARecord — cache it directly. */
export function useNdaAction(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars:
      | { action: 'prepare'; docType?: 'mutual' | 'one-way'; body?: string; signerName?: string; signerEmail?: string }
      | { action: 'send'; signerEmail: string; signerName?: string }
      | { action: 'sign' }
      | { action: 'decline'; reason: string }) => {
      switch (vars.action) {
        case 'prepare':
          return prepareNda(leadId, {
            docType: vars.docType,
            body: vars.body,
            signerName: vars.signerName,
            signerEmail: vars.signerEmail,
          });
        case 'send':
          return sendNda(leadId, { signerEmail: vars.signerEmail, signerName: vars.signerName });
        case 'sign':
          return signNda(leadId);
        case 'decline':
          return declineNda(leadId, vars.reason);
      }
    },
    onSuccess: (record) => {
      queryClient.setQueryData(LEAD_KEYS.nda(leadId), record);
      queryClient.invalidateQueries({ queryKey: ['today'] });
    },
  });
}
