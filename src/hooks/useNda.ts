"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";

import {
  declineNda,
  expireNda,
  getNda,
  listNda,
  sendNda,
  signNda,
} from "@/lib/api/ndaApi";
import { useToast } from "@/hooks/useToast";
import type { NDARecord } from "@/types/nda";

export function useNdaQueue() {
  return useQuery({ queryKey: ["nda"], queryFn: listNda });
}

export function useNdaRecord(leadId: string) {
  return useQuery({
    queryKey: ["nda", leadId],
    queryFn: () => getNda(leadId),
    enabled: Boolean(leadId),
  });
}

function useNdaMutation(
  fn: (leadId: string) => Promise<NDARecord>,
  message: string,
): UseMutationResult<NDARecord, Error, string> {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (leadId: string) => fn(leadId),
    onSuccess: (nda) => {
      qc.setQueryData(["nda", nda.leadId], nda);
      qc.invalidateQueries({ queryKey: ["nda"] });
      // Signing advances the lead's pipeline status — refresh lead caches too.
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["lead", nda.leadId] });
      toast.success(message);
    },
    onError: (e) => toast.error((e as Error).message),
  });
}

export function useSendNda() {
  return useNdaMutation(sendNda, "NDA sent to counterparty");
}

export function useSignNda() {
  return useNdaMutation(signNda, "NDA marked signed");
}

export function useExpireNda() {
  return useNdaMutation(expireNda, "NDA marked expired");
}

/** Decline carries a reason, so it can't use the single-arg factory. */
export function useDeclineNda() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (vars: { leadId: string; reason: string }) =>
      declineNda(vars.leadId, vars.reason),
    onSuccess: (nda) => {
      qc.setQueryData(["nda", nda.leadId], nda);
      qc.invalidateQueries({ queryKey: ["nda"] });
      toast.success("NDA declined");
    },
    onError: (e) => toast.error((e as Error).message),
  });
}
