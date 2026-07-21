import { Badge } from "@/components/ui/badge";
import {
  VALIDATION_STATUS_LABEL,
  type PersonaValidationStatus,
} from "@/types/persona";

const INTENT: Record<PersonaValidationStatus, "success" | "info" | "neutral"> = {
  validated: "success",
  provisional: "info",
  hypothesis: "neutral",
};

/**
 * How much the registry actually knows about this persona.
 *
 * Rendered everywhere a persona appears, deliberately. A seeded row and a row
 * confirmed against real conversations look identical otherwise, and an
 * operator who mistakes the first for the second will prepare a room around a
 * guess. `hypothesis` is the honest default, not a failure state.
 */
export function ValidationStatusBadge({ status }: { status: PersonaValidationStatus }) {
  return <Badge variant={INTENT[status]}>{VALIDATION_STATUS_LABEL[status]}</Badge>;
}
