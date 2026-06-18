import { MOCK_LEADS } from "@/mocks/leads";
import { MOCK_TEAM } from "@/mocks/users";
import type { Role } from "@/constants/roles";
import type { TeamMember } from "@/types/team";

/**
 * In-memory team store for mock mode. Invite/update/remove persist for the
 * server process; resets on restart. Real mode proxies to Django.
 */
let members: TeamMember[] | null = null;

function db(): TeamMember[] {
  if (!members) members = MOCK_TEAM.map((u) => ({ ...u, active: true }));
  return members;
}

/** Attach the live open-lead count owned by this member. */
function withOpenLeads(m: TeamMember): TeamMember {
  const openLeads = MOCK_LEADS.filter(
    (l) => l.owner === m.name && l.status !== "Closed",
  ).length;
  return { ...m, openLeads };
}

export function listTeam(): { results: TeamMember[]; count: number } {
  const results = db().map(withOpenLeads);
  return { results, count: results.length };
}

let seq = 0;
export function inviteMember(input: {
  name: string;
  email: string;
  role: Role;
}): TeamMember {
  const member: TeamMember = {
    id: `u-new-${(seq += 1)}`,
    name: input.name.trim(),
    email: input.email.trim(),
    role: input.role,
    active: true,
  };
  db().push(member);
  return withOpenLeads(member);
}

export function updateMember(
  id: string,
  patch: Partial<Pick<TeamMember, "name" | "email" | "role" | "active">>,
): TeamMember | null {
  const m = db().find((x) => x.id === id);
  if (!m) return null;
  if (patch.name != null) m.name = patch.name.trim();
  if (patch.email != null) m.email = patch.email.trim();
  if (patch.role != null) m.role = patch.role;
  if (patch.active != null) m.active = patch.active;
  return withOpenLeads(m);
}

export function removeMember(id: string): boolean {
  const arr = db();
  const i = arr.findIndex((x) => x.id === id);
  if (i === -1) return false;
  arr.splice(i, 1);
  return true;
}
