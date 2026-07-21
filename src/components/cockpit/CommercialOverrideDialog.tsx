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
import { useCommercialOverride } from "@/hooks/useCustomerNextAction";
import {
  SUPPRESSION_CLEARS_WHEN,
  SUPPRESSION_REASON_LABEL,
  type SuppressionReason,
} from "@/types/nba";

/**
 * Act commercially despite a customer-first suppression.
 *
 * THE RULE BENDS VISIBLY, NEVER SILENTLY. §2.2 is explicit that this is not
 * advisory — a commercial candidate ranked primary while a condition holds is a
 * defect — but also that "the operator may still act commercially by exception,
 * provided the UI shows the condition and logs the override". A rule with no
 * escape hatch gets worked around outside the system, where nobody can see it.
 *
 * The dialog restates the condition rather than just asking for a reason,
 * because the person about to override it should have to read it once more.
 */
export function CommercialOverrideDialog({
  clientId,
  reason: suppression,
  open,
  onOpenChange,
}: {
  clientId: string;
  reason: SuppressionReason;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [justification, setJustification] = useState("");
  const override = useCommercialOverride(clientId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Act commercially anyway?</DialogTitle>
          <DialogDescription>
            {SUPPRESSION_REASON_LABEL[suppression]}. Normally, expansion becomes
            available when {SUPPRESSION_CLEARS_WHEN[suppression]}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="override-reason">Why is an exception right here?</Label>
          <Textarea
            id="override-reason"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="e.g. The customer raised the commercial question themselves on today's call, unprompted."
            rows={3}
          />
          <p className="text-micro text-ink-secondary">
            This is logged with your name. The suppression condition stays in place —
            overriding it records an exception, it does not clear the condition.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={override.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={() =>
              override.mutate(justification, {
                onSuccess: () => {
                  setJustification("");
                  onOpenChange(false);
                },
              })
            }
            disabled={!justification.trim() || override.isPending}
          >
            {override.isPending && <Spinner className="text-current" />}
            Log the override
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
