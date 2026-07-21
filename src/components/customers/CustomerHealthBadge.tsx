import { Badge } from "@/components/ui/badge";
import {
  HEALTH_CLASS_INTENT,
  HEALTH_CLASS_LABEL,
  type HealthClass,
} from "@/types/customer";

/**
 * Customer health — INTERNAL-ONLY as a class.
 *
 * The customer sees their outcomes and their deployment status; they never see
 * a grade about themselves. `health class` is on the client-plane deny-list
 * alongside churn risk and account priority, and this badge exists only on the
 * team plane.
 *
 * It is DERIVED, not stored: an open blocking support issue, an outcome off
 * plan, or a negative feedback pulse. That matters because the same three
 * conditions drive the customer-first suppression rule — if the badge says "at
 * risk", commercial actions are already suppressed, and the two can never
 * disagree.
 */
export function CustomerHealthBadge({ healthClass }: { healthClass: HealthClass }) {
  return (
    <Badge variant={HEALTH_CLASS_INTENT[healthClass]}>
      {HEALTH_CLASS_LABEL[healthClass]}
    </Badge>
  );
}
