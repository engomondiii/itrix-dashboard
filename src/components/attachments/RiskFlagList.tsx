import { Badge } from "@/components/ui/badge";

/**
 * Handling requirements derived from the scan, the format and the plane.
 *
 * INTERNAL-ONLY, ABSOLUTELY. `attachment_risk_flags` is on the client-plane
 * serializer deny-list and, per Surface 2 v5.0 §4.2, "risk flags never appear
 * in any payload this surface sends anywhere else". They describe how to handle
 * a file — they are not a judgement about the person who uploaded it, and
 * nothing here should ever be paraphrased back to them.
 */
export function RiskFlagList({ flags }: { flags: string[] }) {
  if (flags.length === 0) {
    return <span className="text-caption italic text-ink-secondary">None</span>;
  }
  return (
    <ul className="flex flex-wrap gap-1">
      {flags.map((flag) => (
        <li key={flag}>
          <Badge variant="warning">{flag}</Badge>
        </li>
      ))}
    </ul>
  );
}
