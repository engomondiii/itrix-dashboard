"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createClaimCard,
  getClaimCard,
  listClaimCards,
  listGovernanceAudit,
  updateClaimCard,
} from "@/lib/api/governanceApi";
import { useToast } from "@/hooks/useToast";
import type { ClaimCard, ClaimCardInput } from "@/types/claimCard";

export function useClaimCards(level?: number) {
  return useQuery({
    queryKey: ["claim-cards", level ?? "all"],
    queryFn: () => listClaimCards(level),
  });
}

export function useClaimCard(id: string) {
  return useQuery({
    queryKey: ["claim-card", id],
    queryFn: () => getClaimCard(id),
    enabled: Boolean(id),
  });
}

export function useGovernanceAudit(status?: string) {
  return useQuery({
    queryKey: ["governance-audit", status ?? "all"],
    queryFn: () => listGovernanceAudit(status),
  });
}

export function useClaimCardActions() {
  const qc = useQueryClient();
  const { toast } = useToast();

  function done(msg: string, id?: string) {
    qc.invalidateQueries({ queryKey: ["claim-cards"] });
    if (id) qc.invalidateQueries({ queryKey: ["claim-card", id] });
    toast.success(msg);
  }
  function fail(e: unknown) {
    toast.error((e as Error).message);
  }

  return {
    create: useMutation({
      mutationFn: (input: ClaimCardInput) => createClaimCard(input),
      onSuccess: () => done("Claim card created"),
      onError: fail,
    }),
    update: useMutation({
      mutationFn: (v: { id: string; patch: Partial<ClaimCardInput> }) =>
        updateClaimCard(v.id, v.patch),
      onSuccess: (c: ClaimCard) => done("Claim card updated", c.id),
      onError: fail,
    }),
  };
}
