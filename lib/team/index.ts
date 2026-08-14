'use client';

/**
 * The staff roster — GET /api/v1/team/.
 *
 * Read-only by backend design: accounts are provisioned, there is no invite
 * or remove endpoint. It was previously fetched inline by the Settings page;
 * it lives here now because lead assignment needs the same list.
 */

import { useQuery } from '@tanstack/react-query';

import { http } from '@/lib/api/client';
import type { PaginatedEnvelope } from '@/lib/today/types';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  /** Friendly display label ("Operations"), not the permission role. */
  role: string;
  avatarUrl: string | null;
  active: boolean;
  openLeads: number;
}

export function listTeam(search = ''): Promise<PaginatedEnvelope<TeamMember>> {
  const query = search ? `&search=${encodeURIComponent(search)}` : '';
  return http.get<PaginatedEnvelope<TeamMember>>(`/api/v1/team/?pageSize=100${query}`);
}

export function useTeam(search = '', enabled = true) {
  return useQuery({
    queryKey: ['team', search],
    queryFn: () => listTeam(search),
    enabled,
    // The roster changes when someone is provisioned — rare enough that
    // refetching it on every screen that assigns work is pure noise.
    staleTime: 5 * 60_000,
  });
}

/** Active members, lightest workload first — the order you'd assign in. */
export function assignableMembers(members: TeamMember[] | undefined): TeamMember[] {
  return [...(members ?? [])]
    .filter((member) => member.active)
    .sort((a, b) => a.openLeads - b.openLeads || a.name.localeCompare(b.name));
}
