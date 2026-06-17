import { Badge } from "@/components/ui/badge";
import type { PoCStatus } from "@/types/poc";

const VARIANT: Record<PoCStatus, "neutral" | "info" | "success" | "warning" | "error"> = {
  planning: "neutral",
  active: "info",
  completed: "success",
  stalled: "warning",
  cancelled: "error",
};

export function PoCStatusBadge({ status }: { status: PoCStatus }) {
  return <Badge variant={VARIANT[status]}>{status}</Badge>;
}
