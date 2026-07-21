"use client";

import { useState } from "react";

import {
  JOURNEY_EVENT_LABEL,
  JOURNEY_STATE_LABEL,
  REVEAL_SURFACE_LABEL,
} from "@/constants/journeyStates";
import type { JourneyTransition } from "@/types/journey";

function formatAt(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

/** How many transitions to show before collapsing the rest behind a toggle. */
const DEFAULT_VISIBLE = 5;

/**
 * Newest-first list of journey transitions (audit + timeline).
 *
 * A lead that has been advanced repeatedly accumulates dozens of transitions, so
 * the full list is collapsed by default — otherwise it dominates the page.
 */
export function JourneyTimeline({
  transitions,
  visible = DEFAULT_VISIBLE,
}: {
  transitions: JourneyTransition[];
  visible?: number;
}) {
  const [expanded, setExpanded] = useState(false);

  if (transitions.length === 0) {
    return <p className="text-sec text-ink-secondary">No transitions yet.</p>;
  }

  const hidden = Math.max(0, transitions.length - visible);
  const rows = expanded ? transitions : transitions.slice(0, visible);

  return (
    <div className="space-y-2">
      <ol className="space-y-3">
        {rows.map((t) => (
          <li key={t.id} className="relative border-l border-border-soft pl-4">
            <span className="absolute top-1.5 -left-[3px] size-1.5 rounded-full bg-structure-600" />
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sec font-medium text-ink-primary">
                {JOURNEY_EVENT_LABEL[t.event]}
              </span>
              <span className="text-micro text-ink-secondary">{formatAt(t.at)}</span>
            </div>
            <div className="text-caption text-ink-secondary">
              {JOURNEY_STATE_LABEL[t.fromState]} → {JOURNEY_STATE_LABEL[t.toState]}
              {t.reveal ? ` · revealed ${REVEAL_SURFACE_LABEL[t.reveal]}` : ""}
            </div>
          </li>
        ))}
      </ol>

      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-caption font-medium text-ink-primary hover:underline"
        >
          {expanded ? "Show less" : `Show ${hidden} earlier transition${hidden === 1 ? "" : "s"}`}
        </button>
      )}
    </div>
  );
}
