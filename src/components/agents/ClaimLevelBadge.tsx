import { Badge } from "@/components/ui/badge";
import {
  CLAIM_LEVEL_INTENT,
  CLAIM_LEVEL_LABEL,
  type ClaimLevel,
} from "@/constants/claimLevels";

export function ClaimLevelBadge({ level }: { level: ClaimLevel }) {
  return (
    <Badge variant={CLAIM_LEVEL_INTENT[level]}>
      L{level} · {CLAIM_LEVEL_LABEL[level]}
    </Badge>
  );
}
