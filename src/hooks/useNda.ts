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
  prepareNda,
  sendNda,
  signNda,
  type NdaDraftInput,
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

export function useSignNda() {
  return useNdaMutation(signNda, "NDA marked signed");
}

export function useExpireNda() {
  return useNdaMutation(expireNda, "NDA marked expired");
}

/** Shared success handler for the multi-arg NDA mutations. */
function useNdaSync(message: string) {
  const qc = useQueryClient();
  const { toast } = useToast();
  return {
    onSuccess: (nda: NDARecord) => {
      qc.setQueryData(["nda", nda.leadId], nda);
      qc.invalidateQueries({ queryKey: ["nda"] });
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["lead", nda.leadId] });
      toast.success(message);
    },
    onError: (e: unknown) => toast.error((e as Error).message),
  };
}

/** Create/edit the NDA document (stays "required"). */
export function usePrepareNda() {
  return useMutation({
    mutationFn: (vars: { leadId: string; draft: NdaDraftInput }) =>
      prepareNda(vars.leadId, vars.draft),
    ...useNdaSync("NDA document saved"),
  });
}

/** Send carries a signer, so it can't use the single-arg factory. */
export function useSendNda() {
  return useMutation({
    mutationFn: (vars: { leadId: string; signerName?: string; signerEmail: string }) =>
      sendNda(vars.leadId, { signerName: vars.signerName, signerEmail: vars.signerEmail }),
    ...useNdaSync("NDA sent to counterparty"),
  });
}

/** Decline carries a reason, so it can't use the single-arg factory. */
export function useDeclineNda() {
  return useMutation({
    mutationFn: (vars: { leadId: string; reason: string }) =>
      declineNda(vars.leadId, vars.reason),
    ...useNdaSync("NDA declined"),
  });
}
