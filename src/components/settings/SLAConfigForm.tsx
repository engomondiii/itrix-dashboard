"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QueryState } from "@/components/ui/query-state";
import { TIER_DEFS, TIERS, type Tier } from "@/constants/tiers";
import { useSlaConfig, useUpdateSlaConfig } from "@/hooks/useSettings";
import type { SlaConfig } from "@/types/settings";

export function SLAConfigForm() {
  const { data, isLoading, isError } = useSlaConfig();
  const update = useUpdateSlaConfig();
  const [draft, setDraft] = useState<SlaConfig | null>(null);

  const gate = (
    <QueryState
      isLoading={isLoading}
      isError={isError}
      hasData={!!data}
      label="the SLA settings"
    />
  );
  if (!data) return gate;

  const value: SlaConfig = draft ?? data;
  const dirty = draft != null && JSON.stringify(draft) !== JSON.stringify(data);

  function setHours(t: Tier, raw: string) {
    const trimmed = raw.trim();
    const n = trimmed === "" ? null : Number(trimmed);
    if (n != null && (!Number.isFinite(n) || n < 0)) return;
    setDraft({ ...value, [t]: n });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dirty) return;
    update.mutate(value, { onSuccess: () => setDraft(null) });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {TIERS.map((t) => (
        <div
          key={t}
          className="flex items-center justify-between gap-3 rounded-md border border-line bg-surface px-3 py-2"
        >
          <span className="text-sec text-ink-800">
            Tier {t} · {TIER_DEFS[t].label}
          </span>
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              min={0}
              inputMode="numeric"
              aria-label={`Tier ${t} response hours`}
              placeholder="No SLA"
              value={value[t] ?? ""}
              onChange={(e) => setHours(t, e.target.value)}
              className="w-24 text-right tabular-nums"
            />
            <span className="text-caption text-ink-400">hours</span>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between pt-1">
        <p className="text-caption text-ink-400">
          Leave blank for no SLA on a tier.
        </p>
        <Button type="submit" disabled={!dirty || update.isPending}>
          {update.isPending ? "Saving…" : "Save thresholds"}
        </Button>
      </div>
    </form>
  );
}
