import { Badge } from "@/components/ui/badge";
import {
  GOVERNANCE_STATUS_INTENT,
  GOVERNANCE_STATUS_LABEL,
  type GovernanceStatus,
} from "@/constants/governance";

/**
 * The governance verdict on an outbound message. "under_review" always renders
 * as a warning-soft pill — never a hard error color (Surface 2 v3.0 Theme §21).
 */
export function GovernanceStatusPill({ status }: { status: GovernanceStatus | string }) {
  const known = status in GOVERNANCE_STATUS_LABEL ? (status as GovernanceStatus) : null;
  if (!known) return <Badge variant="neutral">{status}</Badge>;
  return (
    <Badge variant={GOVERNANCE_STATUS_INTENT[known]}>
      {GOVERNANCE_STATUS_LABEL[known]}
    </Badge>
  );
}
