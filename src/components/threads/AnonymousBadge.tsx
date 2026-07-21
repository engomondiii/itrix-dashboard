import { Badge } from "@/components/ui/badge";
import {
  IDENTITY_STATE_LABEL,
  type IdentityState,
} from "@/constants/shellContract";

const INTENT: Record<IdentityState, "neutral" | "info" | "success"> = {
  anonymous: "neutral",
  identified: "info",
  authenticated_customer: "success",
};

/**
 * Which identity plane a thread is on.
 *
 * This is the single most consequential fact about a thread for an operator: it
 * sets the disclosure ceiling, it decides whether a named owner may be shown,
 * and it is the difference between "a visitor we know nothing about" and "a
 * contracted customer". It leads every row for that reason.
 */
export function AnonymousBadge({ identityState }: { identityState: IdentityState }) {
  return <Badge variant={INTENT[identityState]}>{IDENTITY_STATE_LABEL[identityState]}</Badge>;
}
