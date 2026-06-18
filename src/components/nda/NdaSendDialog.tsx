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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSendNda } from "@/hooks/useNda";
import type { NDARecord } from "@/types/nda";

/** Send the drafted NDA to a named signer (required -> sent). */
export function NdaSendDialog({
  nda,
  onClose,
}: {
  nda: NDARecord;
  onClose: () => void;
}) {
  const send = useSendNda();
  const [signerName, setSignerName] = useState(nda.signerName ?? "");
  const [signerEmail, setSignerEmail] = useState(nda.signerEmail ?? "");
  const valid = signerEmail.trim().length > 0;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || send.isPending) return;
    send.mutate(
      { leadId: nda.leadId, signerName: signerName.trim() || undefined, signerEmail: signerEmail.trim() },
      { onSuccess: onClose },
    );
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
            <DialogTitle>Send NDA</DialogTitle>
            <DialogDescription>
              Send the {nda.docType === "mutual" ? "mutual" : "one-way"} NDA to{" "}
              {nda.company ?? "the counterparty"} for signature.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="nda-signer-name">Signer name</Label>
            <Input
              id="nda-signer-name"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Who will sign?"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nda-signer-email">Signer email</Label>
            <Input
              id="nda-signer-email"
              type="email"
              value={signerEmail}
              onChange={(e) => setSignerEmail(e.target.value)}
              placeholder="signer@company.com"
            />
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={!valid || send.isPending}>
              {send.isPending ? "Sending…" : "Send for signature"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
