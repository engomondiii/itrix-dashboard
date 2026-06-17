"use client";

import { useQuery } from "@tanstack/react-query";

import { getEvaluation, getPoC, listEvaluations, listPoCs } from "@/lib/api/dealsApi";

export function useEvaluations() {
  return useQuery({ queryKey: ["evaluations"], queryFn: listEvaluations });
}
export function useEvaluation(id: string) {
  return useQuery({
    queryKey: ["evaluation", id],
    queryFn: () => getEvaluation(id),
    enabled: Boolean(id),
  });
}
export function usePoCs() {
  return useQuery({ queryKey: ["pocs"], queryFn: listPoCs });
}
export function usePoC(id: string) {
  return useQuery({ queryKey: ["poc", id], queryFn: () => getPoC(id), enabled: Boolean(id) });
}
