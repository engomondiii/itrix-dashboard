"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiGet, apiSend } from "@/lib/api/client";
import { API } from "@/constants/routes";
import { useToast } from "@/hooks/useToast";
import type { CommercialOverride, CustomerNextAction } from "@/types/nba";

export function useCustomerNextAction(clientId: string) {
  return useQuery({
    queryKey: ["customer-next-action", clientId],
    queryFn: () => apiGet<CustomerNextAction>(API.cockpitCustomerNextAction(clientId)),
    enabled: Boolean(clientId),
  });
}

/**
 * Record a commercial override.
 *
 * The next-action cache is deliberately NOT invalidated on success: the
 * override does not change the recommendation, and refetching would suggest it
 * had. The suppression condition is still true — a human has simply chosen to
 * act against it, on the record.
 */
export function useCommercialOverride(clientId: string) {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (reason: string) =>
      apiSend<CommercialOverride>(API.cockpitCustomerNextAction(clientId), "POST", {
        reason,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["commercial-overrides", clientId] });
      toast.success("Override logged. The suppression condition still stands.");
    },
    onError: (e) => toast.error((e as Error).message),
  });
}
