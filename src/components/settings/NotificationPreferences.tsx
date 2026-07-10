"use client";

import { Label } from "@/components/ui/label";
import { QueryState } from "@/components/ui/query-state";
import { Switch } from "@/components/ui/switch";
import {
  useNotificationPrefs,
  useUpdateNotificationPrefs,
} from "@/hooks/useSettings";
import type { NotificationPrefs } from "@/types/settings";

const PREFS = [
  { key: "tier1", label: "New Tier 1 lead" },
  { key: "sla", label: "Follow-up past SLA" },
  { key: "nda", label: "NDA signed" },
  { key: "weekly", label: "Weekly pipeline report" },
] as const satisfies ReadonlyArray<{ key: keyof NotificationPrefs; label: string }>;

export function NotificationPreferences() {
  const { data, isLoading, isError } = useNotificationPrefs();
  const update = useUpdateNotificationPrefs();

  if (!data) {
    return (
      <QueryState
        isLoading={isLoading}
        isError={isError}
        hasData={false}
        label="your notification preferences"
      />
    );
  }

  const prefs = data;
  function toggle(key: keyof NotificationPrefs, on: boolean) {
    update.mutate({ ...prefs, [key]: on });
  }

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
            checked={data[p.key]}
            onCheckedChange={(v) => toggle(p.key, !!v)}
            disabled={update.isPending}
          />
        </div>
      ))}
    </div>
  );
}
