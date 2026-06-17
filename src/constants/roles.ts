/**
 * Team roles. Visitor-facing names are always presented as an "iTrix" service;
 * IWL is never exposed to visitors. Source: Master Architecture Flow §9.1.
 * These map to the internal team-member role field in settings/team.
 */

export const ROLES = [
  "Admin",
  "Assessment Team",
  "Technical Review Team",
  "Expert Concierge",
  "Success Team",
  "Specialist",
  "Media Contact",
] as const;
export type Role = (typeof ROLES)[number];

export interface RoleDef {
  role: Role;
  /** Visitor-facing display name (what leads see). */
  visitorFacing: string;
  handles: string;
}

export const ROLE_DEFS: Record<Role, RoleDef> = {
  Admin: {
    role: "Admin",
    visitorFacing: "iTrix",
    handles: "Full dashboard administration, team and SLA configuration",
  },
  "Assessment Team": {
    role: "Assessment Team",
    visitorFacing: "iTrix Assessment Team",
    handles: "Personalized assessment, initial guidance, Tier 3 nurture",
  },
  "Technical Review Team": {
    role: "Technical Review Team",
    visitorFacing: "iTrix Technical Review Team",
    handles: "Technical escalation, NDA-level disclosures, engineering follow-up",
  },
  "Expert Concierge": {
    role: "Expert Concierge",
    visitorFacing: "iTrix Expert Concierge",
    handles: "High-value Tier 1 discussions, exclusive pathway escalation",
  },
  "Success Team": {
    role: "Success Team",
    visitorFacing: "iTrix Success Team",
    handles: "Post-qualification follow-up, evaluation & PoC coordination",
  },
  Specialist: {
    role: "Specialist",
    visitorFacing: "iTrix Specialist",
    handles: "Investor briefings, strategic partner & shareholder discussions",
  },
  "Media Contact": {
    role: "Media Contact",
    visitorFacing: "iTrix Media Contact",
    handles: "Journalist / content-creator / media-kit requests",
  },
};
