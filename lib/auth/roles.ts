/**
 * Who is allowed to hand work to someone else.
 *
 * The presentation feedback was "a designated person has the power to assign
 * leads — team leaders". The backend has no TEAM_LEAD permission role; its
 * vocabulary is ADMIN / ASSESSMENT / SPECIALIST / VIEWER. So team leader maps
 * onto ADMIN here, which is the closest existing thing and requires no
 * invention on the frontend.
 *
 * OPEN, and deliberately isolated to this one function so the answer is a
 * single edit: if a real TEAM_LEAD role is added backend-side, change the
 * check here and every call site follows. Until then, "team leader" means
 * "has ADMIN permission role".
 *
 * Self-claim is separate and stays open to everyone — see canClaimLeads.
 */

import type { AuthUser } from './types';

/** ADMIN passes every check on the backend too; kept as one string here. */
export const TEAM_LEADER_ROLE = 'ADMIN';

/** May assign a lead to another person. */
export function canAssignToOthers(user: AuthUser | null | undefined): boolean {
  return user?.permissionRole === TEAM_LEADER_ROLE;
}

/**
 * May take an unowned lead for themselves.
 *
 * Everyone signed in can. Deliberate: a queue nobody may pull from stalls the
 * moment the leader is off shift, which on a two-site rota is half the day.
 * If assignment is ever meant to be the ONLY route in, this is the function
 * to tighten.
 */
export function canClaimLeads(user: AuthUser | null | undefined): boolean {
  return Boolean(user?.email);
}
