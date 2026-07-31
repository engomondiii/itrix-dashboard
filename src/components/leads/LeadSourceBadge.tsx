import { Badge } from "@/components/ui/badge";
import { LEAD_SOURCE_LABEL, isLeadSource } from "@/types/lead";

/**
 * How this subject entered the system (Surface 2 v7.1 §04.7).
 *
 * `conversation` is the platform's default door, so it renders quietly;
 * `self_serve` and `imported` are the provenance an operator actually needs to
 * notice before reading the rest of the row — a self-serve subject was never
 * qualified by Layer 1 until they spoke, and an imported one never spoke here
 * at all. An unrecognised value renders as the raw string, never nothing: a
 * badge that vanishes for an unknown provenance is a row that lies about
 * where somebody came from.
 */
export function LeadSourceBadge({ source }: { source: string | undefined }) {
  if (!source) return null;

  if (!isLeadSource(source)) {
    return (
      <Badge variant="error" title="Unrecognised lead source — vocabulary drift">
        {source}
      </Badge>
    );
  }

  return (
    <Badge
      variant={source === "conversation" ? "neutral" : "info"}
      title="How this subject entered the system"
    >
      {LEAD_SOURCE_LABEL[source]}
    </Badge>
  );
}
