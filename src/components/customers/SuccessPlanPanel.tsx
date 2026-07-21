import { CheckIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { SuccessPlan } from "@/types/customer";
import { cn } from "@/lib/utils";

const HORIZONS = [30, 60, 90] as const;

/**
 * The shared 30/60/90 plan.
 *
 * DEPENDENCIES ARE FLAGGED EARLY, on purpose: "these items need something from
 * your side. We have flagged them early so they do not surprise anyone"
 * (Playbook v1.6 §12F). A plan that only surfaces a customer dependency at the
 * moment it blocks us has already failed — the point of showing them here is
 * that a success owner can chase them before they bite.
 */
export function SuccessPlanPanel({ plan }: { plan: SuccessPlan }) {
  return (
    <div className="space-y-4">
      {HORIZONS.map((horizon) => {
        const milestones = plan.milestones.filter((m) => m.horizonDays === horizon);
        if (milestones.length === 0) return null;

        return (
          <div key={horizon} className="space-y-1.5">
            <div className="text-micro font-semibold uppercase tracking-[0.06em] text-ink-secondary">
              {horizon} days
            </div>
            <ul className="space-y-1.5">
              {milestones.map((m) => (
                <li key={m.id} className="flex items-start gap-2">
                  <span
                    className={cn(
                      "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full",
                      m.done ? "bg-success-soft text-success-text" : "bg-soft",
                    )}
                    aria-hidden="true"
                  >
                    {m.done && <CheckIcon className="size-2.5" />}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={cn(
                        "text-sec",
                        m.done ? "text-ink-secondary line-through" : "text-ink-primary",
                      )}
                    >
                      {m.title}
                    </span>
                    <span className="ml-1.5 inline-flex gap-1">
                      <Badge variant="neutral">{m.owner}</Badge>
                      {m.dependency && !m.done && (
                        <Badge variant="warning">Needs the customer</Badge>
                      )}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
