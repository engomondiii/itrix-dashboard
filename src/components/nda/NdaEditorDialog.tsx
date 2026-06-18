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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePrepareNda } from "@/hooks/useNda";
import { NDA_DOC_TYPES, NDA_DOC_TYPE_LABELS, type NDADocType, type NDARecord } from "@/types/nda";

/** Review and edit the NDA document + signer before it's sent. */
export function NdaEditorDialog({
  nda,
  onClose,
}: {
  nda: NDARecord;
  onClose: () => void;
}) {
  const prepare = usePrepareNda();
  const [docType, setDocType] = useState<NDADocType>(nda.docType);
  const [body, setBody] = useState(nda.body);
  const [signerName, setSignerName] = useState(nda.signerName ?? "");
  const [signerEmail, setSignerEmail] = useState(nda.signerEmail ?? "");

  const valid = body.trim().length > 0;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || prepare.isPending) return;
    prepare.mutate(
      {
        leadId: nda.leadId,
        draft: {
          docType,
          body,
          signerName: signerName.trim() || undefined,
          signerEmail: signerEmail.trim() || undefined,
        },
      },
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
      <DialogContent showCloseButton={false} className="sm:max-w-xl">
        <form onSubmit={onSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Edit NDA document</DialogTitle>
            <DialogDescription>
              Review the terms and counterparty before sending for signature.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="nda-type">Type</Label>
              <Select value={docType} onValueChange={(v) => setDocType(v as NDADocType)}>
                <SelectTrigger id="nda-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NDA_DOC_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {NDA_DOC_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nda-signer">Signer name</Label>
              <Input
                id="nda-signer"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Counterparty signer"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nda-email">Signer email</Label>
              <Input
                id="nda-email"
                type="email"
                value={signerEmail}
                onChange={(e) => setSignerEmail(e.target.value)}
                placeholder="signer@company.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nda-body">Document</Label>
            <Textarea
              id="nda-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              className="max-h-80 font-mono text-caption"
            />
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={!valid || prepare.isPending}>
              {prepare.isPending ? "Saving…" : "Save draft"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
