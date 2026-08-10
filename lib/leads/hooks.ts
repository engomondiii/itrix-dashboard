'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { listLeads, type LeadListParams } from './api';

export function useLeads(params: LeadListParams) {
  return useQuery({
    queryKey: ['leads', 'list', params],
    queryFn: () => listLeads(params),
    // Keep the previous page on screen while a filter change loads — a
    // flashing empty table reads as data loss.
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
  });
}
