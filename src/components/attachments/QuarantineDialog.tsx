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
 * Quarantine a file an operator is not comfortable with.
 *
 * Unlike a release, a reason is OPTIONAL here: restricting access to something
 * that looked wrong is always defensible, and requiring justification to be
 * cautious would discourage the safe action. A note is still recorded when one
 * is given, because the next person to look will want to know what was seen.
 */
export function QuarantineDialog({
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
      { action: "quarantine", reason },
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
          <DialogTitle>Quarantine “{filename}”?</DialogTitle>
          <DialogDescription>
            The file becomes unreadable by the agent layer and cannot be previewed or
            downloaded from this queue until it is explicitly released.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="quarantine-reason">Note (optional)</Label>
          <Textarea
            id="quarantine-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="What made this look wrong?"
            rows={2}
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
          <Button variant="destructive" onClick={submit} disabled={action.isPending}>
            {action.isPending && <Spinner className="text-current" />}
            Quarantine
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
