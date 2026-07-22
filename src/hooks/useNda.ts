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
  type NdaQuery,
} from "@/lib/api/ndaApi";
import { useToast } from "@/hooks/useToast";
import type { NDARecord } from "@/types/nda";

export function useNdaQueue(query: NdaQuery = {}) {
  return useQuery({
    queryKey: ["nda", "list", query],
    queryFn: () => listNda(query),
  });
}

export function useNdaRecord(leadId: string) {
  return useQuery({
    queryKey: ["nda", leadId],
    queryFn: () => getNda(leadId),
    enabled: Boolean(leadId),
  });
}

/**
 * Only ONE of the five NDA transitions moves the lead.
 *
 * `signNda` calls `setStatus(leadId, "Evaluation")` when the lead is at "NDA" —
 * a signed NDA clears it into the evaluation stage — so signing moves the card
 * from the NDA column to Evaluation on the pipeline board. `prepare`, `send`,
 * `decline` and `expire` only write the NDA override and leave `lead.status`
 * alone.
 *
 * So `["pipeline"]` is refreshed for signing and nothing else: expiring an NDA
 * should not refetch the whole board.
 */
function useNdaMutation(
  fn: (leadId: string) => Promise<NDARecord>,
  message: string,
  alsoInvalidate: readonly (readonly unknown[])[] = [],
): UseMutationResult<NDARecord, Error, string> {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (leadId: string) => fn(leadId),
    onSuccess: (nda) => {
      qc.setQueryData(["nda", nda.leadId], nda);
      qc.invalidateQueries({ queryKey: ["nda"] });
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["lead", nda.leadId] });
      for (const queryKey of alsoInvalidate) qc.invalidateQueries({ queryKey });
      toast.success(message);
    },
    onError: (e) => toast.error((e as Error).message),
  });
}

export function useSignNda() {
  // Signing moves the lead NDA → Evaluation; the board must follow.
  return useNdaMutation(signNda, "NDA marked signed", [["pipeline"]]);
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
