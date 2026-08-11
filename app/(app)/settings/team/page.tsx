'use client';

/**
 * Team — who's on the staff and what they're carrying. Read-only by backend
 * design: there is no invite or remove endpoint (accounts are provisioned;
 * deactivation is an admin PATCH we don't surface yet).
 */

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { http } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import { SettingsSection } from '@/components/ui/settings-section';
import type { PaginatedEnvelope } from '@/lib/today/types';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  active: boolean;
  openLeads: number;
}

export default function TeamSettingsPage() {
  // Server-side search (?search= over name and email).
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search);
  const team = useQuery({
    queryKey: ['settings', 'team', debounced],
    queryFn: () =>
      http.get<PaginatedEnvelope<TeamMember>>(
        `/api/v1/team/?pageSize=100${debounced ? `&search=${encodeURIComponent(debounced)}` : ''}`,
      ),
  });

  return (
    <SettingsSection
      title="Team"
      description="Everyone with staff access. Accounts are provisioned by an admin — there's no self-serve invite."
    >
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search name or email…"
        className="mb-3 h-8 w-56 rounded-md border border-input bg-card px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      {team.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <ul className="divide-y divide-border/60">
          {(team.data?.results ?? []).map((member) => (
            <li key={member.id} className="flex flex-wrap items-center gap-3 py-2.5 text-sm">
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground',
                  !member.active && 'opacity-50',
                )}
              >
                {member.name
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join('')
                  .toUpperCase() || '?'}
              </span>
              <span className={cn('min-w-0', !member.active && 'opacity-50')}>
                <span className="block font-medium">{member.name}</span>
                <span className="block text-xs text-muted-foreground">{member.email}</span>
              </span>
              <span className="ml-auto text-xs text-muted-foreground">{member.role}</span>
              <span className="w-20 text-right text-xs text-muted-foreground" data-numeric>
                {member.active ? `${member.openLeads} open` : 'inactive'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </SettingsSection>
  );
}
