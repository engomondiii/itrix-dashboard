import { CheckIcon, LockIcon } from "lucide-react";

import {
  REVEAL_ORDINAL,
  REVEAL_SURFACES,
  REVEAL_SURFACE_LABEL,
} from "@/constants/journeyStates";
import type { JourneyTransition } from "@/types/journey";
import { cn } from "@/lib/utils";

/** The four reveals ①–④, marked achieved where a transition unlocked them. */
export function RevealLog({ transitions }: { transitions: JourneyTransition[] }) {
  const achieved = new Set(transitions.map((t) => t.reveal).filter(Boolean));

  return (
    <ul className="space-y-1.5">
      {REVEAL_SURFACES.map((surface) => {
        const done = achieved.has(surface);
        return (
          <li key={surface} className="flex items-center gap-2 text-sec">
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full",
                done ? "bg-success-soft text-success-text" : "bg-muted text-ink-400",
              )}
            >
              {done ? <CheckIcon className="size-3" /> : <LockIcon className="size-3" />}
            </span>
            <span className="tabular-nums text-ink-400">{REVEAL_ORDINAL[surface]}</span>
            <span className={done ? "text-ink-800" : "text-ink-400"}>
              {REVEAL_SURFACE_LABEL[surface]}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
