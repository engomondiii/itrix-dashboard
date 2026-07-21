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
import { useSupportActions } from "@/hooks/useSupport";

/**
 * Escalate a support request to blocking.
 *
 * THIS HAS CONSEQUENCES BEYOND THE QUEUE, and the dialog says so. Marking a
 * request blocking makes it step 1 of the customer-first precedence rule: every
 * commercial action for this customer is suppressed until it clears, and their
 * health drops to at-risk. That is the correct behaviour — but an operator
 * should know they are triggering it rather than discover it later when the
 * cockpit refuses to offer an expansion.
 */
export function EscalateDialog({
  requestId,
  open,
  onOpenChange,
}: {
  requestId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [reason, setReason] = useState("");
  const { escalate } = useSupportActions(requestId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Escalate to blocking?</DialogTitle>
          <DialogDescription>
            This marks the request blocking. While it is open, every commercial action
            for this customer is suppressed and their health reads as at-risk. That is
            intended — expansion becomes available again once it is resolved.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="escalate-reason">Why is this blocking?</Label>
          <Textarea
            id="escalate-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Production inference is stalling on the customer's main fleet."
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={escalate.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              escalate.mutate(reason, {
                onSuccess: () => {
                  setReason("");
                  onOpenChange(false);
                },
              })
            }
            disabled={!reason.trim() || escalate.isPending}
          >
            {escalate.isPending && <Spinner className="text-current" />}
            Escalate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
