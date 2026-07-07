/**
 * UI permission helpers (Surface 2 v3.0 RBAC).
 *
 * The backend gates the elevated actions with `IsJourneyController` /
 * `IsGovernanceAdmin` (role ∈ {ADMIN, ASSESSMENT}). Surface 2 uses display roles
 * (see `constants/roles.ts`); we map the two elevated display roles onto that
 * backend tier. These helpers only *hide* controls — the backend is authoritative
 * and re-checks every write, so a spoofed client can never actually advance state
 * or edit a claim card.
 */

import type { Role } from "@/constants/roles";

/** Display roles that correspond to the backend ADMIN / ASSESSMENT tier. */
export const ELEVATED_ROLES: readonly Role[] = ["Admin", "Assessment Team"];

function isElevated(role: Role | null | undefined): boolean {
  return !!role && ELEVATED_ROLES.includes(role);
}

/** May manually advance a lead's journey state (backend `IsJourneyController`). */
export const canControlJourney = isElevated;

/** May create / edit Claim-Cards and act on the approval queue (`IsGovernanceAdmin`). */
export const canAdminGovernance = isElevated;
