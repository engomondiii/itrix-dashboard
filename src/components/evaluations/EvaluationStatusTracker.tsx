import { Badge } from "@/components/ui/badge";
import type { EvaluationStatus } from "@/types/evaluation";

const VARIANT: Record<EvaluationStatus, "neutral" | "info" | "warning" | "success" | "error"> = {
  proposed: "neutral",
  in_progress: "info",
  delivered: "warning",
  won: "success",
  lost: "error",
};

const LABEL: Record<EvaluationStatus, string> = {
  proposed: "Proposed",
  in_progress: "In progress",
  delivered: "Delivered",
  won: "Won",
  lost: "Lost",
};

export function EvaluationStatusTracker({ status }: { status: EvaluationStatus }) {
  return <Badge variant={VARIANT[status]}>{LABEL[status]}</Badge>;
}
