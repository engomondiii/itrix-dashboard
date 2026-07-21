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
import { useAttachmentAction } from "@/hooks/useAttachments";

/**
 * Release a quarantined file back into reach of the agent layer.
 *
 * THE REASON IS THE POINT. Releasing overrides a scanner that flagged this
 * file; the audit trail has to record who decided that and why, so the confirm
 * button stays disabled until a reason is written. The API enforces the same
 * rule — this is the affordance, not the control.
 *
 * Quarantine (the opposite direction) needs no justification: restricting
 * access to a suspicious file is always defensible, so it is a plain confirm.
 */
export function ReleaseDialog({
  attachmentId,
  filename,
  open,
  onOpenChange,
}: {
  attachmentId: string;
  filename: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [reason, setReason] = useState("");
  const action = useAttachmentAction(attachmentId);

  const submit = () => {
    action.mutate(
      { action: "release", reason },
      {
        onSuccess: () => {
          setReason("");
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Release “{filename}”?</DialogTitle>
          <DialogDescription>
            This file was quarantined by a scan. Releasing it makes it readable by the
            agent layer again. The decision, your name and this reason are written to the
            audit trail.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="release-reason">Reason for release</Label>
          <Textarea
            id="release-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Confirmed false positive — the signature matches a benign test string in the sample data."
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={action.isPending}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={!reason.trim() || action.isPending}>
            {action.isPending && <Spinner className="text-current" />}
            Release
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
