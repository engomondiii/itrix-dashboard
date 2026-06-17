import { Badge } from "@/components/ui/badge";
import { STATUS_INTENT, type LeadStatus } from "@/constants/statuses";

const INTENT_VARIANT = {
  info: "info",
  warning: "warning",
  success: "success",
  neutral: "neutral",
} as const;

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return <Badge variant={INTENT_VARIANT[STATUS_INTENT[status]]}>{status}</Badge>;
}
