"use client";

import { useQuery } from "@tanstack/react-query";

import { getReport, listReports } from "@/lib/api/reportingApi";

export function useReports() {
  return useQuery({ queryKey: ["reports"], queryFn: listReports });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: ["report", id],
    queryFn: () => getReport(id),
    enabled: Boolean(id),
  });
}
