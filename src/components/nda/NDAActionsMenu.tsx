"use client";

import { ClockAlertIcon, MoreVerticalIcon, XCircleIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeclineNda, useExpireNda } from "@/hooks/useNda";

/** Decline / expire actions for a pending NDA. */
export function NDAActionsMenu({ leadId }: { leadId: string }) {
  const decline = useDeclineNda();
  const expire = useExpireNda();
  const pending = decline.isPending || expire.isPending;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="NDA actions"
        disabled={pending}
        className="inline-flex size-7 items-center justify-center rounded-md text-ink-400 outline-none hover:bg-muted hover:text-ink-700 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      >
        <MoreVerticalIcon className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => decline.mutate(leadId)}>
          <XCircleIcon />
          Decline
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => expire.mutate(leadId)}>
          <ClockAlertIcon />
          Mark expired
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
