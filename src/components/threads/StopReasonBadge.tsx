import { Badge } from "@/components/ui/badge";
import {
  STOP_REASON_INTENT,
  STOP_REASON_LABEL,
  type StopReason,
} from "@/constants/listeningDimensions";

/**
 * Why the question loop stopped.
 *
 * `covered` means the loop finished. `budget_exhausted` means it gave up — the
 * artifact was generated on thinner ground than intended, which is worth an
 * operator's attention and is rendered as a warning for that reason.
 *
 * An open loop renders nothing rather than a placeholder: there is no stop
 * reason yet, and inventing one ("in progress") would put a fourth value into a
 * vocabulary the backend only has three of.
 */
export function StopReasonBadge({ stopReason }: { stopReason: StopReason | null }) {
  if (!stopReason) return null;
  return (
    <Badge variant={STOP_REASON_INTENT[stopReason]}>{STOP_REASON_LABEL[stopReason]}</Badge>
  );
}
