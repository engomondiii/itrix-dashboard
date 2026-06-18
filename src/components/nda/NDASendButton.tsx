"use client";

import { SendIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSendNda } from "@/hooks/useNda";

/** Send a drafted ("required") NDA to the counterparty. */
export function NDASendButton({ leadId }: { leadId: string }) {
  const send = useSendNda();
  return (
    <Button size="sm" onClick={() => send.mutate(leadId)} disabled={send.isPending}>
      <SendIcon />
      Send NDA
    </Button>
  );
}
