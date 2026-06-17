"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getNda, listNda, signNda } from "@/lib/api/ndaApi";
import { useToast } from "@/hooks/useToast";

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

export function useSignNda() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (leadId: string) => signNda(leadId),
    onSuccess: (nda) => {
      qc.setQueryData(["nda", nda.leadId], nda);
      qc.invalidateQueries({ queryKey: ["nda"] });
      toast.success("NDA marked signed");
    },
    onError: (e) => toast.error((e as Error).message),
  });
}
