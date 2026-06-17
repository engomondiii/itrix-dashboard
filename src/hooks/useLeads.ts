"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { listLeads, type LeadQuery } from "@/lib/api/leadsApi";

export function useLeads(query: LeadQuery) {
  return useQuery({
    queryKey: ["leads", query],
    queryFn: () => listLeads(query),
    placeholderData: keepPreviousData,
  });
}
