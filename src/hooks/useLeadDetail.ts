"use client";

import { useQuery } from "@tanstack/react-query";

import { getLead } from "@/lib/api/leadsApi";

export function useLeadDetail(id: string) {
  return useQuery({
    queryKey: ["lead", id],
    queryFn: () => getLead(id),
    enabled: Boolean(id),
  });
}
