"use client";

import { useState } from "react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const PREFS = [
  { key: "tier1", label: "New Tier 1 lead" },
  { key: "sla", label: "Follow-up past SLA" },
  { key: "nda", label: "NDA signed" },
  { key: "weekly", label: "Weekly pipeline report" },
] as const;

export function NotificationPreferences() {
  const [on, setOn] = useState<Record<string, boolean>>({
    tier1: true,
    sla: true,
    nda: false,
    weekly: true,
  });

  return (
    <div className="space-y-3">
      {PREFS.map((p) => (
        <div
          key={p.key}
          className="flex items-center justify-between rounded-md border border-line bg-surface px-3 py-2"
        >
          <Label htmlFor={`pref-${p.key}`} className="text-sec text-ink-800">
            {p.label}
          </Label>
          <Switch
            id={`pref-${p.key}`}
            checked={on[p.key]}
            onCheckedChange={(v) => setOn((s) => ({ ...s, [p.key]: !!v }))}
          />
        </div>
      ))}
    </div>
  );
}
