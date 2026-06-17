import { Badge } from "@/components/ui/badge";
import type { PoCRisk, RiskSeverity } from "@/types/poc";

const SEVERITY: Record<RiskSeverity, "neutral" | "warning" | "error"> = {
  low: "neutral",
  medium: "warning",
  high: "error",
};

export function PoCRiskLog({ risks }: { risks: PoCRisk[] }) {
  if (risks.length === 0) {
    return <p className="text-caption text-ink-400">No risks logged.</p>;
  }
  return (
    <ul className="space-y-2">
      {risks.map((r) => (
        <li key={r.id} className="rounded-md bg-surface-sunken p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sec text-ink-800">{r.description}</span>
            <Badge variant={SEVERITY[r.severity]}>{r.severity}</Badge>
          </div>
          {r.mitigation && (
            <div className="mt-1 text-caption text-ink-500">Mitigation: {r.mitigation}</div>
          )}
        </li>
      ))}
    </ul>
  );
}
