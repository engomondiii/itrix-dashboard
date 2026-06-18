"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePoCActions } from "@/hooks/useDeals";
import { RISK_SEVERITIES, type PoCRisk, type RiskSeverity } from "@/types/poc";

const SEVERITY_LABELS: Record<RiskSeverity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

/** Add (no `risk`) or edit (with `risk`) a PoC risk. */
export function PoCRiskDialog({
  pocId,
  risk,
  onClose,
}: {
  pocId: string;
  risk?: PoCRisk;
  onClose: () => void;
}) {
  const { addRisk, updateRisk } = usePoCActions(pocId);
  const editing = !!risk;

  const [description, setDescription] = useState(risk?.description ?? "");
  const [severity, setSeverity] = useState<RiskSeverity>(risk?.severity ?? "medium");
  const [mitigation, setMitigation] = useState(risk?.mitigation ?? "");

  const pending = addRisk.isPending || updateRisk.isPending;
  const valid = description.trim().length > 0;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || pending) return;
    const payload = {
      description: description.trim(),
      severity,
      mitigation: mitigation.trim(),
    };
    if (editing && risk) {
      updateRisk.mutate({ riskId: risk.id, patch: payload }, { onSuccess: onClose });
    } else {
      addRisk.mutate(payload, { onSuccess: onClose });
    }
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
            <DialogTitle>{editing ? "Edit risk" : "Add risk"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="risk-desc">Description</Label>
            <Input
              id="risk-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="risk-severity">Severity</Label>
            <Select
              value={severity}
              onValueChange={(v) => setSeverity(String(v) as RiskSeverity)}
            >
              <SelectTrigger id="risk-severity" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RISK_SEVERITIES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {SEVERITY_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="risk-mitigation">Mitigation</Label>
            <Textarea
              id="risk-mitigation"
              value={mitigation}
              onChange={(e) => setMitigation(e.target.value)}
              placeholder="Optional mitigation plan…"
              className="min-h-24"
            />
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={!valid || pending}>
              {pending ? "Saving…" : editing ? "Save changes" : "Add risk"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
