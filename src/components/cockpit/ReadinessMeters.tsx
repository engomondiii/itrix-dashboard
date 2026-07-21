import type { CockpitReadiness } from "@/types/cockpit";

import { CockpitMeter } from "./CockpitMeter";

/**
 * How close this lead is to each rung of the ladder.
 *
 * Three separate readings rather than one "readiness score", because they move
 * independently and for different reasons — someone can be ready for an NDA and
 * nowhere near a PoC. Collapsing them would hide the gap that tells a concierge
 * what to work on next.
 */
export function ReadinessMeters({ readiness }: { readiness?: CockpitReadiness }) {
  if (!readiness) return null;
  return (
    <div className="space-y-2">
      <CockpitMeter label="NDA" value={readiness.nda} />
      <CockpitMeter label="Assessment" value={readiness.assessment} />
      <CockpitMeter label="PoC" value={readiness.poc} />
    </div>
  );
}
