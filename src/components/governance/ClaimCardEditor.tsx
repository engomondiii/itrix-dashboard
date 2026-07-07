"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useClaimCardActions } from "@/hooks/useClaimCards";
import { CLAIM_LEVELS, CLAIM_LEVEL_LABEL, type ClaimLevel } from "@/constants/claimLevels";
import type { ClaimCard } from "@/types/claimCard";

const FIELD =
  "w-full rounded-md border border-line bg-surface p-2 text-sec text-ink-800 outline-none focus:border-sapphire-500";

/** Create (no `card`) or edit (with `card`) a Claim-Card. */
export function ClaimCardEditor({
  card,
  onDone,
}: {
  card?: ClaimCard;
  onDone?: () => void;
}) {
  const actions = useClaimCardActions();
  const [key, setKey] = useState(card?.key ?? "");
  const [title, setTitle] = useState(card?.title ?? "");
  const [approvedWording, setApprovedWording] = useState(card?.approvedWording ?? "");
  const [claimLevel, setClaimLevel] = useState<ClaimLevel>(card?.claimLevel ?? 1);
  const [isActive, setIsActive] = useState(card?.isActive ?? true);
  const [notes, setNotes] = useState(card?.notes ?? "");
  const busy = actions.create.isPending || actions.update.isPending;

  function save() {
    const payload = { key, title, approvedWording, claimLevel, isActive, notes };
    if (card) {
      actions.update.mutate({ id: card.id, patch: payload }, { onSuccess: () => onDone?.() });
    } else {
      if (!key || !title || !approvedWording) return;
      actions.create.mutate(payload, { onSuccess: () => onDone?.() });
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-line bg-surface p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-micro text-ink-400">Key</span>
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className={FIELD}
            placeholder="alpha_core_execution"
          />
        </label>
        <label className="space-y-1">
          <span className="text-micro text-ink-400">Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={FIELD} />
        </label>
      </div>
      <label className="block space-y-1">
        <span className="text-micro text-ink-400">Approved wording</span>
        <textarea
          value={approvedWording}
          onChange={(e) => setApprovedWording(e.target.value)}
          rows={3}
          className={FIELD}
        />
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2">
          <span className="text-micro text-ink-400">Claim level</span>
          <select
            value={claimLevel}
            onChange={(e) => setClaimLevel(Number(e.target.value) as ClaimLevel)}
            className="rounded-md border border-line bg-surface px-2 py-1 text-sec text-ink-800"
          >
            {CLAIM_LEVELS.map((l) => (
              <option key={l} value={l}>
                L{l} · {CLAIM_LEVEL_LABEL[l]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sec text-ink-700">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Active
        </label>
      </div>
      <label className="block space-y-1">
        <span className="text-micro text-ink-400">Notes</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className={FIELD}
        />
      </label>
      <div className="flex gap-2">
        <Button size="sm" disabled={busy} onClick={save}>
          {card ? "Save changes" : "Create card"}
        </Button>
        {onDone && (
          <Button size="sm" variant="ghost" disabled={busy} onClick={onDone}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
