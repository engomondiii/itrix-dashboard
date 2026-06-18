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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEAD_STATUSES, type LeadStatus } from "@/constants/statuses";
import { useLeadActions } from "@/hooks/useLeadActions";

export function LeadStatusControl({
  leadId,
  status,
}: {
  leadId: string;
  status: LeadStatus;
}) {
  const { setStatus } = useLeadActions(leadId);
  const [closeReason, setCloseReason] = useState("");
  const [closing, setClosing] = useState(false);

  function onSelect(v: LeadStatus) {
    if (v === status) return;
    // Closing a lead is terminal — record why (lost, no fit, won elsewhere…).
    if (v === "Closed") {
      setCloseReason("");
      setClosing(true);
      return;
    }
    setStatus.mutate({ status: v });
  }

  return (
    <>
      <Select value={status} onValueChange={(v) => onSelect(v as LeadStatus)}>
        <SelectTrigger size="sm" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LEAD_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={closing} onOpenChange={setClosing}>
        <DialogContent showCloseButton={false}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!closeReason.trim() || setStatus.isPending) return;
              setStatus.mutate(
                { status: "Closed", reason: closeReason.trim() },
                { onSuccess: () => setClosing(false) },
              );
            }}
            className="space-y-4"
          >
            <DialogHeader>
              <DialogTitle>Close this lead</DialogTitle>
              <DialogDescription>
                Closing is terminal — note why so the pipeline stays honest.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-1.5">
              <Label htmlFor="close-reason">Reason</Label>
              <Textarea
                id="close-reason"
                value={closeReason}
                onChange={(e) => setCloseReason(e.target.value)}
                rows={3}
                placeholder="e.g. Lost to in-house build; budget cut; not a technical fit"
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
                disabled={!closeReason.trim() || setStatus.isPending}
              >
                {setStatus.isPending ? "Closing…" : "Close lead"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
