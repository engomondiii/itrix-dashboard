import type { Role } from "@/constants/roles";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string | null;
  active: boolean;
  /** Open leads currently owned by this member. */
  openLeads?: number;
}
