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
import { useLeadActions } from "@/hooks/useLeadActions";

const TIMELINES = ["ASAP", "1 week", "2 weeks", "1 month"];

/** Capture the scope, fee, and timeline a paid evaluation needs before opening it. */
export function RequestEvaluationDialog({
  leadId,
  onClose,
}: {
  leadId: string;
  onClose: () => void;
}) {
  const { requestEvaluation } = useLeadActions(leadId);
  const [scope, setScope] = useState("");
  const [fee, setFee] = useState("");
  const [timeline, setTimeline] = useState("2 weeks");

  const valid = scope.trim().length > 0;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || requestEvaluation.isPending) return;
    requestEvaluation.mutate(
      { scope: scope.trim(), fee: fee.trim() || undefined, timeline },
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
            <DialogTitle>Request paid evaluation</DialogTitle>
            <DialogDescription>
              Define what the evaluation will cover so engineering can scope it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="eval-scope">Scope</Label>
            <Textarea
              id="eval-scope"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              rows={3}
              placeholder="e.g. Benchmark the nightly CFD workload against ALPHA Compute; quantify runtime + memory gains"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="eval-fee">Fee</Label>
              <Input
                id="eval-fee"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                placeholder="e.g. $8,000"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="eval-timeline">Timeline</Label>
              <Select value={timeline} onValueChange={(v) => setTimeline(String(v))}>
                <SelectTrigger id="eval-timeline" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMELINES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={!valid || requestEvaluation.isPending}>
              {requestEvaluation.isPending ? "Opening…" : "Open evaluation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
