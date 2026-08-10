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
import { formatRelative } from '@/lib/entity/format';
import type { ApprovalRow } from '@/lib/today/types';
import { QueueCard } from '../queue-card';
import { ReasonAction } from '../reason-action';
import { TodayBand } from '../today-band';
import { ShowMore, useCapped } from '../use-capped';

/** Staff-facing risk vocabulary (spec: claim level). */
const RISK_LABEL: Record<number, string> = {
  1: 'Risk 1 · conversational',
  2: 'Risk 2 · qualitative',
  3: 'Risk 3 · needs citation',
  4: 'Risk 4 · commercial',
  5: 'Risk 5 · legal',
};

function ApprovalCard({ row }: { row: ApprovalRow }) {
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
            title: action === 'approve' ? (secondOk ? 'Second OK given' : 'Approved') : 'Rejected',
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
          {secondOk ? 'Needs a second OK' : 'Needs an OK'} · {RISK_LABEL[row.claimLevel]}
          {secondOk && row.firstApprover ? (
            <span className="text-muted-foreground"> (first OK: {row.firstApprover})</span>
          ) : null}
        </>
      }
      meta={
        <>
          “{snippet}
          {snippet.length < (row.finalBody || row.draftBody).length ? '…' : ''}” ·{' '}
          {formatRelative(row.at)}
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
              {secondOk ? 'Give second OK' : 'Approve'}
            </Button>
            <ReasonAction
              label="Reject"
              placeholder="Why this can't go out"
              busy={act.isPending}
              onConfirm={(reason) => run('reject', reason)}
            />
          </>
        ) : undefined
      }
    />
  );
}

export function ApprovalsBand() {
  const queue = useApprovalQueue();
  const rows = queue.data ?? [];
  const { visible, remaining, showMore } = useCapped(rows);

  return (
    <TodayBand
      title="Waiting for your OK"
      hint="messages the AI won't send without a human"
      count={rows.length}
      isLoading={queue.isLoading}
      alwaysShow
      tone="urgent"
    >
      {rows.length === 0 && !queue.isLoading ? (
        <p className="px-1 text-sm text-muted-foreground">
          Nothing waiting — the AI has no held drafts right now.
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
