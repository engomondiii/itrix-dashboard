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

const DURATIONS = [
  { value: "2", label: "2 weeks" },
  { value: "4", label: "4 weeks" },
  { value: "8", label: "8 weeks" },
];

/** Capture the scope, duration, metrics and start date a PoC needs before opening it. */
export function MarkPoCDialog({
  leadId,
  onClose,
}: {
  leadId: string;
  onClose: () => void;
}) {
  const { markPoC } = useLeadActions(leadId);
  const [scope, setScope] = useState("");
  const [duration, setDuration] = useState("4");
  const [successMetrics, setSuccessMetrics] = useState("");
  const [startDate, setStartDate] = useState("");

  const valid = scope.trim().length > 0;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || markPoC.isPending) return;
    markPoC.mutate(
      {
        scope: scope.trim(),
        durationWeeks: Number(duration),
        successMetrics: successMetrics.trim() || undefined,
        startDate: startDate || undefined,
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
      <DialogContent showCloseButton={false}>
        <form onSubmit={onSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Mark PoC candidate</DialogTitle>
            <DialogDescription>
              Scope the proof-of-concept so it stays bounded and measurable.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="poc-scope">Scope</Label>
            <Textarea
              id="poc-scope"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              rows={3}
              placeholder="e.g. Port the solver hot path to ALPHA Core; validate runtime + reproducibility"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="poc-duration">Duration</Label>
              <Select value={duration} onValueChange={(v) => setDuration(String(v))}>
                <SelectTrigger id="poc-duration" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="poc-start">Start date</Label>
              <Input
                id="poc-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="poc-metrics">Success metrics</Label>
            <Textarea
              id="poc-metrics"
              value={successMetrics}
              onChange={(e) => setSuccessMetrics(e.target.value)}
              rows={2}
              placeholder="e.g. ≥30% runtime reduction at equal accuracy; reproducible across 3 runs"
            />
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={!valid || markPoC.isPending}>
              {markPoC.isPending ? "Opening…" : "Open PoC"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
