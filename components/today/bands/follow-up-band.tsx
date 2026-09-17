'use client';

/**
 * Bands 2 and 6 — follow-ups. Same card, two scopes:
 *   overdue → tone "urgent", oldest first (server orders by due)
 *   today   → tone "neutral", what's still ahead of you today
 *
 * Inline: Done / Snooze 24h / Dismiss. Snooze sets `snoozedUntil` only —
 * the due date is unchanged, which is what pulls it out of "overdue".
 * Rescheduling (a date picker) belongs to the lead screen, not a card.
 */

import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { normalizeError } from '@/lib/api/errors';
import { useAuth } from '@/lib/auth/auth-context';
import { useFollowUp, useFollowUpAction } from '@/lib/today/hooks';
import type { FollowUpRow } from '@/lib/today/types';
import { QueueCard } from '../queue-card';
import { inScope, type TodayScope } from '../scope';
import { TodayBand } from '../today-band';
import { ShowMore, useCapped } from '../use-capped';
import { Stamp } from '@/components/shared/timestamp';
import { useCopy } from '@/lib/i18n/locale-provider';

function FollowUpCard({ row, urgent }: { row: FollowUpRow; urgent: boolean }) {
  const copy = useCopy();
  const { toast } = useToast();
  const act = useFollowUpAction();

  function run(action: 'complete' | 'snooze' | 'dismiss') {
    act.mutate(
      { id: row.id, action },
      {
        onSuccess: () =>
          toast({
            title:
              action === 'complete'
                ? copy.today.doneToast
                : action === 'snooze'
                  ? copy.today.snoozedToast
                  : copy.today.dismissedToast,
            tone: action === 'complete' ? 'success' : 'default',
          }),
        onError: (error) =>
          toast({ title: normalizeError(error).message, tone: 'destructive' }),
      },
    );
  }

  return (
    <QueueCard
      tone={urgent ? 'urgent' : 'neutral'}
      href={`/leads/${row.leadId}`}
      title={
        <>
          {row.leadName || row.company}
          {row.company && row.leadName ? (
            <span className="text-muted-foreground"> · {row.company}</span>
          ) : null}
        </>
      }
      meta={
        <>
          {row.note || copy.today.followUpFallback} · P{row.tier} · {copy.today.due}{' '}
          <Stamp at={row.dueAt} />
          {row.owner ? ` · ${row.owner}` : ` · ${copy.status.unassigned}`}
        </>
      }
      actions={
        <>
          <Button size="sm" disabled={act.isPending} onClick={() => run('complete')}>
            {copy.today.done}
          </Button>
          <Button size="sm" variant="outline" disabled={act.isPending} onClick={() => run('snooze')}>
            {copy.today.snooze24h}
          </Button>
          <Button size="sm" variant="ghost" disabled={act.isPending} onClick={() => run('dismiss')}>
            {copy.today.dismiss}
          </Button>
        </>
      }
    />
  );
}

export function FollowUpBand({
  scope,
  ownerScope,
  forceOpen = false,
}: {
  scope: 'overdue' | 'today';
  ownerScope: TodayScope;
  forceOpen?: boolean;
}) {
  const copy = useCopy();
  const { user } = useAuth();
  const list = useFollowUp(scope);
  const rows = (list.data?.results ?? []).filter((row) =>
    inScope(ownerScope, row.owner, user?.name),
  );
  const urgent = scope === 'overdue';
  const { visible, remaining, showMore } = useCapped(rows);

  return (
    <TodayBand
      forceOpen={forceOpen}
      title={urgent ? copy.today.overdueTitle : copy.today.dueTodayTitle}
      storageKey={urgent ? 'overdue' : 'due-today'}
      hint={urgent ? copy.today.overdueHint : copy.today.dueTodayHint}
      count={rows.length}
      isLoading={list.isLoading}
      tone={urgent ? 'urgent' : 'neutral'}
    >
      {visible.map((row) => (
        <FollowUpCard key={row.id} row={row} urgent={urgent} />
      ))}
      <ShowMore remaining={remaining} onClick={showMore} />
    </TodayBand>
  );
}
