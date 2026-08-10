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
import { useFollowUp, useFollowUpAction } from '@/lib/today/hooks';
import { formatRelative } from '@/lib/entity/format';
import type { FollowUpRow } from '@/lib/today/types';
import { QueueCard } from '../queue-card';
import { TodayBand } from '../today-band';

function FollowUpCard({ row, urgent }: { row: FollowUpRow; urgent: boolean }) {
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
                ? 'Done'
                : action === 'snooze'
                  ? 'Snoozed 24h'
                  : 'Dismissed',
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
      href="/leads"
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
          {row.note || 'Follow up'} · P{row.tier} · due {formatRelative(row.dueAt)}
          {row.owner ? ` · ${row.owner}` : ' · unassigned'}
        </>
      }
      actions={
        <>
          <Button size="sm" disabled={act.isPending} onClick={() => run('complete')}>
            Done
          </Button>
          <Button size="sm" variant="outline" disabled={act.isPending} onClick={() => run('snooze')}>
            Snooze 24h
          </Button>
          <Button size="sm" variant="ghost" disabled={act.isPending} onClick={() => run('dismiss')}>
            Dismiss
          </Button>
        </>
      }
    />
  );
}

export function FollowUpBand({ scope }: { scope: 'overdue' | 'today' }) {
  const list = useFollowUp(scope);
  const rows = list.data?.results ?? [];
  const urgent = scope === 'overdue';

  return (
    <TodayBand
      title={urgent ? 'Overdue follow-ups' : 'Due today'}
      hint={urgent ? 'oldest first — these slipped' : 'still ahead of you today'}
      count={rows.length}
      isLoading={list.isLoading}
      tone={urgent ? 'urgent' : 'neutral'}
    >
      {rows.map((row) => (
        <FollowUpCard key={row.id} row={row} urgent={urgent} />
      ))}
    </TodayBand>
  );
}
