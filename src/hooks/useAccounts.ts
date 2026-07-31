"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getAccounts, resendVerification } from "@/lib/api/accountsApi";

export function useAccounts() {
  return useQuery({ queryKey: ["accounts"], queryFn: getAccounts });
}

export function useResendVerification(clientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => resendVerification(clientId, reason),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
