import { SLA_HOURS } from "@/constants/sla";
import { TIER_DEFS, TIERS } from "@/constants/tiers";

/** Read-only SLA threshold display (editable once the backend is wired). */
export function SLAConfigForm() {
  return (
    <div className="space-y-3">
      {TIERS.map((t) => {
        const hours = SLA_HOURS[t];
        return (
          <div
            key={t}
            className="flex items-center justify-between rounded-md border border-line bg-surface px-3 py-2"
          >
            <span className="text-sec text-ink-800">
              Tier {t} · {TIER_DEFS[t].label}
            </span>
            <span className="text-sec tabular-nums text-ink-500">
              {hours == null ? "No SLA" : `${hours}h response`}
            </span>
          </div>
        );
      })}
      <p className="text-caption text-ink-400">
        Thresholds become editable when the Django backend is connected.
      </p>
    </div>
  );
}
