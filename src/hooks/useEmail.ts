"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { sendEmail, type SendEmailInput } from "@/lib/api/emailApi";
import { useToast } from "@/hooks/useToast";

/** Queue an outbound email (follow-ups, proposals). */
export function useSendEmail() {
  const { toast } = useToast();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SendEmailInput) => sendEmail(input),
    onSuccess: (data, vars) => {
      toast.success(data?.scheduled ? "Follow-up scheduled" : "Email queued for sending");
      // A lead-scoped send adds a timeline entry — refresh the detail + list.
      if (vars.leadId) {
        qc.invalidateQueries({ queryKey: ["lead", vars.leadId] });
        qc.invalidateQueries({ queryKey: ["leads"] });
      }
    },
    onError: (e) => toast.error((e as Error).message),
  });
}
