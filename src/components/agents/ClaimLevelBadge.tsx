import { Badge } from "@/components/ui/badge";
import {
  CLAIM_LEVEL_INTENT,
  CLAIM_LEVEL_LABEL,
  type ClaimLevel,
} from "@/constants/claimLevels";

/**
 * A claim level of 0 means "no claim was made" — the backend's `AgentRun.claim_level`
 * defaults to 0 for deterministic runs that assert nothing. Render that as its own
 * state rather than an empty `L0 ·` badge.
 */
export function ClaimLevelBadge({ level }: { level: ClaimLevel | 0 }) {
  if (!level || !(level in CLAIM_LEVEL_LABEL)) {
    return <Badge variant="neutral">No claim</Badge>;
  }
  const known = level as ClaimLevel;
  return (
    <Badge variant={CLAIM_LEVEL_INTENT[known]}>
      L{known} · {CLAIM_LEVEL_LABEL[known]}
    </Badge>
  );
}
