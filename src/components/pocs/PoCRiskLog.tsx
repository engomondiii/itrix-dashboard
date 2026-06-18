"use client";

import { useState } from "react";
import { MoreVerticalIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { PoCRiskDialog } from "@/components/pocs/PoCRiskDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePoCActions } from "@/hooks/useDeals";
import type { PoCRisk, RiskSeverity } from "@/types/poc";

const SEVERITY: Record<RiskSeverity, "neutral" | "warning" | "error"> = {
  low: "neutral",
  medium: "warning",
  high: "error",
};

export function PoCRiskLog({
  pocId,
  risks,
}: {
  pocId: string;
  risks: PoCRisk[];
}) {
  const { removeRisk } = usePoCActions(pocId);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<PoCRisk | null>(null);
  const [confirming, setConfirming] = useState<PoCRisk | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
          <PlusIcon />
          Add risk
        </Button>
      </div>

      {risks.length === 0 ? (
        <p className="text-caption text-ink-400">No risks logged.</p>
      ) : (
        <ul className="space-y-2">
          {risks.map((r) => (
            <li key={r.id} className="rounded-md bg-surface-sunken p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sec text-ink-800">{r.description}</span>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Badge variant={SEVERITY[r.severity]}>{r.severity}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      aria-label="Risk actions"
                      className="inline-flex size-6 items-center justify-center rounded-md text-ink-400 outline-none hover:bg-muted hover:text-ink-700 focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <MoreVerticalIcon className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditing(r)}>
                        <PencilIcon />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setConfirming(r)}
                      >
                        <Trash2Icon />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              {r.mitigation && (
                <div className="mt-1 text-caption text-ink-500">
                  Mitigation: {r.mitigation}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {adding && <PoCRiskDialog pocId={pocId} onClose={() => setAdding(false)} />}
      {editing && (
        <PoCRiskDialog
          pocId={pocId}
          risk={editing}
          onClose={() => setEditing(null)}
        />
      )}
      <ConfirmDialog
        open={!!confirming}
        onOpenChange={(o) => {
          if (!o) setConfirming(null);
        }}
        title="Remove risk?"
        description={confirming ? `“${confirming.description}” will be removed.` : ""}
        confirmLabel="Remove"
        destructive
        loading={removeRisk.isPending}
        onConfirm={() => {
          if (!confirming) return;
          removeRisk.mutate(confirming.id, { onSuccess: () => setConfirming(null) });
        }}
      />
    </div>
  );
}
