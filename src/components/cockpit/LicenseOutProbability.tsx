import { Badge } from "@/components/ui/badge";

import { CockpitMeter } from "./CockpitMeter";

/**
 * License-out likelihood — an INTERNAL DIRECTIONAL SIGNAL ONLY.
 *
 * It is not a forecast, it is not a commitment, and it is never shown to a
 * visitor or a client (`license_out_probability` is on the client-plane
 * serializer deny-list). The "Directional" badge is not decoration: this number
 * gets quoted in meetings, and it needs to arrive already qualified.
 */
export function LicenseOutProbability({ value }: { value?: number }) {
  if (typeof value !== "number") return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="text-micro font-semibold uppercase tracking-[0.06em] text-ink-secondary">
          License-out probability
        </div>
        <Badge variant="signature">Directional</Badge>
      </div>
      <CockpitMeter label="Likelihood" value={value} />
      <p className="text-micro text-ink-secondary">
        Internal directional signal only — never a prediction, never shown to the
        visitor.
      </p>
    </div>
  );
}
