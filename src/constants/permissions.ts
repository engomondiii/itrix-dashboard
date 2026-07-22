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

/**
 * May administer the team roster and delete shared templates.
 *
 * STRICTER THAN `isElevated`. The backend gates `team` (all writes) and the
 * templates `destroy` action with `IsAdminOrReadOnly`, which is literally
 * `role == ADMIN` — Assessment Team is *not* included, unlike the
 * `IsJourneyController` / `IsGovernanceAdmin` tier the two helpers above mirror.
 * Reusing `isElevated` here would show an Assessment Team operator a "Remove
 * member" / "Delete template" button that 403s only *after* they confirm a
 * destructive dialog.
 *
 * Template *create* and *edit* are deliberately not gated: the backend guards
 * those with `IsNotViewer`, and Surface 2 has no VIEWER display role to mirror
 * it with (see `constants/roles.ts`).
 */
export function canAdministerTeam(role: Role | null | undefined): boolean {
  return role === "Admin";
}
