import type { CockpitLead } from "@/types/cockpit";

import { BuyerPsychologyNote } from "./BuyerPsychologyNote";
import { ObjectionSignals } from "./ObjectionSignals";

function Line({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <p className="text-sec text-ink-secondary">
      <span className="font-medium text-ink-primary">{label}:</span> {value}
    </p>
  );
}

/**
 * The visitor in their own words.
 *
 * Pain and gain are quotes from the conversation, not our summary of the
 * person. Everything in this card is a reading of what was said — which is why
 * it sits apart from the scored fields: a concierge preparing for a call needs
 * to be able to tell those two things apart at a glance.
 */
export function VisitorReadCard({ cockpit }: { cockpit: CockpitLead }) {
  return (
    <div className="space-y-1.5">
      <Line label="Type" value={cockpit.visitorType} />
      <Line label="Pain" value={cockpit.pain} />
      <Line label="Gain" value={cockpit.gain} />
      <BuyerPsychologyNote note={cockpit.buyerPsychology} />
      <ObjectionSignals signals={cockpit.objectionSignals} />
    </div>
  );
}
