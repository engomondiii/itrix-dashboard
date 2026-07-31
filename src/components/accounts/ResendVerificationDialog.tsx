"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useResendVerification } from "@/hooks/useAccounts";

/**
 * Resend a verification email (Surface 2 v7.1 §04.9).
 *
 * An operator action with a typed reason, logged with the operator's identity
 * and rate-limited server-side per address. The reason is also required at the
 * API — this dialog is the polite surface of that rule, not its enforcement.
 * Its value is that it exists later, when someone asks why an email was sent
 * to an address that had not asked for one.
 */
export function ResendVerificationDialog({
  clientId,
  email,
  open,
  onOpenChange,
}: {
  clientId: string;
  email: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [reason, setReason] = useState("");
  const resend = useResendVerification(clientId);

  const submit = () => {
    resend.mutate(reason, {
      onSuccess: () => {
        setReason("");
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resend the verification email?</DialogTitle>
          <DialogDescription>
            A fresh verification link goes to {email}. The previous link stops working,
            the send is rate-limited per address, and your name and this reason are
            logged.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="resend-reason">Why is a resend right here?</Label>
          <Textarea
            id="resend-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. The account holder called support — the original email landed in quarantine on their side."
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={resend.isPending}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={!reason.trim() || resend.isPending}>
            {resend.isPending && <Spinner className="text-current" />}
            Resend and log
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
