'use client';

/**
 * Band 1 — messages the AI wants to send that need a human OK.
 *
 * Approve / reject act inline (ADMIN and ASSESSMENT roles only — the backend
 * 403s anyone else, so others see a read-only card with an "Open" link).
 * Editing a draft is the Approvals screen's job, not a card's.
 *
 * The card keys "needs a second OK" on `status === 'awaiting_second'` — the
 * `requiresSecondApprover` flag is true from creation on L4/L5 and does NOT
 * mean one is still outstanding.
 */

import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { normalizeError } from '@/lib/api/errors';
import { useAuth } from '@/lib/auth/auth-context';
import { useApprovalAction, useApprovalQueue } from '@/lib/today/hooks';
import type { ApprovalRow } from '@/lib/today/types';
import { QueueCard } from '../queue-card';
import { ReasonAction } from '../reason-action';
import { TodayBand } from '../today-band';
import { ShowMore, useCapped } from '../use-capped';
import { Stamp } from '@/components/shared/timestamp';
import { useCopy } from '@/lib/i18n/locale-provider';

function ApprovalCard({ row }: { row: ApprovalRow }) {
  const copy = useCopy();
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const act = useApprovalAction();
  const canAct = hasPermission(['ADMIN', 'ASSESSMENT']);

  const secondOk = row.status === 'awaiting_second';
  const snippet = (row.finalBody || row.draftBody).slice(0, 140);

  function run(action: 'approve' | 'reject', reason?: string) {
    act.mutate(
      { id: row.id, action, reason },
      {
        onSuccess: () =>
          toast({
            title:
              action === 'approve'
                ? secondOk
                  ? copy.today.secondOkToast
                  : copy.today.approvedToast
                : copy.today.rejectedToast,
            tone: action === 'approve' ? 'success' : 'default',
          }),
        onError: (error) =>
          toast({ title: normalizeError(error).message, tone: 'destructive' }),
      },
    );
  }

  return (
    <QueueCard
      tone={row.claimLevel >= 4 ? 'urgent' : 'warn'}
      href="/approvals"
      title={
        <>
          {secondOk ? copy.today.needsSecondOk : copy.today.needsOk} ·{' '}
          {copy.status.riskLabel(row.claimLevel)}
          {secondOk && row.firstApprover ? (
            <span className="text-muted-foreground"> {copy.today.firstOkBy(row.firstApprover)}</span>
          ) : null}
        </>
      }
      meta={
        <>
          “{snippet}
          {snippet.length < (row.finalBody || row.draftBody).length ? '…' : ''}” ·{' '}
          <Stamp at={row.at} />
        </>
      }
      actions={
        canAct ? (
          <>
            <Button
              size="sm"
              disabled={act.isPending}
              onClick={() => run('approve')}
            >
              {secondOk ? copy.today.giveSecondOk : copy.today.approve}
            </Button>
            <ReasonAction
              label={copy.today.reject}
              placeholder={copy.today.rejectPlaceholder}
              busy={act.isPending}
              onConfirm={(reason) => run('reject', reason)}
            />
          </>
        ) : undefined
      }
    />
  );
}

export function ApprovalsBand({ forceOpen = false }: { forceOpen?: boolean }) {
  const copy = useCopy();
  const queue = useApprovalQueue();
  const rows = queue.data ?? [];
  const { visible, remaining, showMore } = useCapped(rows);

  return (
    <TodayBand
      forceOpen={forceOpen}
      title={copy.today.approvalsTitle}
      storageKey="approvals"
      hint={copy.today.approvalsHint}
      count={rows.length}
      isLoading={queue.isLoading}
      alwaysShow
      tone="urgent"
    >
      {rows.length === 0 && !queue.isLoading ? (
        <p className="px-1 text-sm text-muted-foreground">
          {copy.today.approvalsEmpty}
        </p>
      ) : (
        <>
          {visible.map((row) => (
            <ApprovalCard key={row.id} row={row} />
          ))}
          <ShowMore remaining={remaining} onClick={showMore} />
        </>
      )}
    </TodayBand>
  );
}
