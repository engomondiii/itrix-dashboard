'use client';

/**
 * Band 4 — new leads to take. Sorted priority-first client-side (the server
 * sorts by one field at a time). "Take it" assigns the signed-in user by
 * their own email — there is no assign-to-me endpoint.
 */

import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { normalizeError } from '@/lib/api/errors';
import { useAuth } from '@/lib/auth/auth-context';
import { useNewLeads, useTakeLead } from '@/lib/today/hooks';
import { formatRelative } from '@/lib/entity/format';
import type { LeadRow } from '@/lib/today/types';
import { QueueCard } from '../queue-card';
import { inScope, type TodayScope } from '../scope';
import { TodayBand } from '../today-band';
import { ShowMore, useCapped } from '../use-capped';

function LeadCard({ row }: { row: LeadRow }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const take = useTakeLead();

  return (
    <QueueCard
      tone={row.tier === 1 ? 'urgent' : 'neutral'}
      href={`/leads/${row.id}`}
      title={
        <>
          {row.company || row.visitorName}
          <span className="text-muted-foreground">
            {' '}
            · P{row.tier} · score {row.score}
          </span>
        </>
      }
      meta={
        <>
          {row.primaryPain || row.productRoute || 'New enquiry'} · {formatRelative(row.submittedAt)}
          {row.owner ? ` · ${row.owner}` : ''}
        </>
      }
      actions={
        !row.owner && user?.email ? (
          <Button
            size="sm"
            disabled={take.isPending}
            onClick={() =>
              take.mutate(
                { id: row.id, owner: user.email },
                {
                  onSuccess: () => toast({ title: `${row.company || 'Lead'} is yours`, tone: 'success' }),
                  onError: (error) =>
                    toast({ title: normalizeError(error).message, tone: 'destructive' }),
                },
              )
            }
          >
            Take it
          </Button>
        ) : undefined
      }
    />
  );
}

export function NewLeadsBand({ ownerScope, forceOpen = false }: { ownerScope: TodayScope; forceOpen?: boolean }) {
  const { user } = useAuth();
  const leads = useNewLeads();
  // Priority 1 first, then newest within a priority.
  const rows = [...(leads.data?.results ?? [])]
    .filter((row) => inScope(ownerScope, row.owner, user?.name))
    .sort((a, b) => a.tier - b.tier || b.submittedAt.localeCompare(a.submittedAt));
  const { visible, remaining, showMore } = useCapped(rows);

  return (
    <TodayBand
      forceOpen={forceOpen}
      title="New leads"
      hint="unworked — highest priority first"
      count={rows.length}
      isLoading={leads.isLoading}
      tone="neutral"
    >
      {visible.map((row) => (
        <LeadCard key={row.id} row={row} />
      ))}
      <ShowMore remaining={remaining} onClick={showMore} />
    </TodayBand>
  );
}
