"use client";

import { FileSignatureIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSignNda } from "@/hooks/useNda";

export function NDAMarkCompleteButton({
  leadId,
  signed,
}: {
  leadId: string;
  signed: boolean;
}) {
  const sign = useSignNda();
  if (signed) return null;
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => sign.mutate(leadId)}
      disabled={sign.isPending}
    >
      <FileSignatureIcon />
      Mark signed
    </Button>
  );
}
