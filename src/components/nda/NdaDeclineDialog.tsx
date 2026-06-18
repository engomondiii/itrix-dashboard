"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDeclineNda } from "@/hooks/useNda";

/** Decline an NDA with a reason (terms, legal review, lost the deal, …). */
export function NdaDeclineDialog({
  leadId,
  onClose,
}: {
  leadId: string;
  onClose: () => void;
}) {
  const decline = useDeclineNda();
  const [reason, setReason] = useState("");
  const valid = reason.trim().length > 0;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || decline.isPending) return;
    decline.mutate({ leadId, reason: reason.trim() }, { onSuccess: onClose });
  }

  return (
    <Dialog
      open
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent showCloseButton={false}>
        <form onSubmit={onSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Decline NDA</DialogTitle>
            <DialogDescription>
              Record why this NDA was declined for the audit trail.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="nda-decline-reason">Reason</Label>
            <Textarea
              id="nda-decline-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. Counterparty rejected the confidentiality terms; legal review stalled"
              autoFocus
            />
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button
              type="submit"
              variant="destructive"
              disabled={!valid || decline.isPending}
            >
              {decline.isPending ? "Declining…" : "Decline NDA"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
