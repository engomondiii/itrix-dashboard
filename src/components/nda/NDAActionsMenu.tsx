"use client";

import { useState } from "react";
import { ClockAlertIcon, MoreVerticalIcon, XCircleIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NdaDeclineDialog } from "@/components/nda/NdaDeclineDialog";
import { useExpireNda } from "@/hooks/useNda";

/** Decline / expire actions for a pending NDA. */
export function NDAActionsMenu({ leadId }: { leadId: string }) {
  const expire = useExpireNda();
  const [declining, setDeclining] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="NDA actions"
          disabled={expire.isPending}
          className="inline-flex size-7 items-center justify-center rounded-md text-ink-secondary outline-none hover:bg-muted hover:text-ink-secondary focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          <MoreVerticalIcon className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setDeclining(true)}>
            <XCircleIcon />
            Decline
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => expire.mutate(leadId)}>
            <ClockAlertIcon />
            Mark expired
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {declining && (
        <NdaDeclineDialog leadId={leadId} onClose={() => setDeclining(false)} />
      )}
    </>
  );
}
