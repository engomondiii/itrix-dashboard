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
import { useEvaluationActions } from "@/hooks/useDeals";
import type { EvaluationKPI } from "@/types/evaluation";

export function EvaluationKpiDialog({
  evaluationId,
  kpi,
  onClose,
}: {
  evaluationId: string;
  kpi: EvaluationKPI;
  onClose: () => void;
}) {
  const { updateKpi } = useEvaluationActions(evaluationId);
  const [metric, setMetric] = useState(kpi.metric);
  const [target, setTarget] = useState(kpi.target ?? "");
  const [result, setResult] = useState(kpi.result ?? "");

  const pending = updateKpi.isPending;
  const valid = metric.trim().length > 0;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || pending) return;
    updateKpi.mutate(
      {
        kpiId: kpi.id,
        patch: { metric: metric.trim(), target: target.trim(), result: result.trim() },
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
            <DialogTitle>Edit KPI · {kpi.category}</DialogTitle>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="kpi-metric">Metric</Label>
            <Input
              id="kpi-metric"
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="kpi-target">Target</Label>
              <Input
                id="kpi-target"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="—"
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="kpi-result">Result</Label>
              <Input
                id="kpi-result"
                value={result}
                onChange={(e) => setResult(e.target.value)}
                placeholder="—"
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={!valid || pending}>
              {pending ? "Saving…" : "Save KPI"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
