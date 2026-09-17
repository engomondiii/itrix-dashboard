'use client';

/**
 * Approvals — the full-width home of the approve/edit/reject flow. The Today
 * band shows the same queue in card form; this screen adds the full draft
 * text and edit-then-approve.
 *
 * Permission reality (backend-enforced): anyone on the team can READ the
 * queue; only ADMIN and ASSESSMENT can act. Editing keeps the item pending —
 * an edited draft still needs its OK. L4/L5 approvals need a second,
 * distinct approver; the backend 409s a same-person second OK.
 */

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { normalizeError } from '@/lib/api/errors';
import { useAuth } from '@/lib/auth/auth-context';
import { useApprovalAction, useApprovalQueue } from '@/lib/today/hooks';
import type { ApprovalRow } from '@/lib/today/types';
import { ReasonAction } from '@/components/today/reason-action';
import { ShowMore, useCapped } from '@/components/today/use-capped';
import { Stamp } from '@/components/shared/timestamp';
import { useCopy } from '@/lib/i18n/locale-provider';

function ApprovalCard({ row, canAct }: { row: ApprovalRow; canAct: boolean }) {
  const copy = useCopy();
  const { toast } = useToast();
  const act = useApprovalAction();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(row.finalBody || row.draftBody);

  const secondOk = row.status === 'awaiting_second';

  function onError(error: unknown) {
    toast({ title: normalizeError(error).message, tone: 'destructive' });
  }

  return (
    <article
      className={cn(
        'glass-surface rounded-xl border-l-2 p-4',
        row.claimLevel >= 4 ? 'border-l-destructive' : 'border-l-warning',
      )}
    >
      <header className="mb-2 flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium">
          {secondOk ? copy.today.needsSecondOk : copy.today.needsOk}
        </span>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-semibold',
            row.claimLevel >= 4 ? 'bg-destructive-soft text-destructive' : 'bg-warning-soft text-warning',
          )}
        >
          {copy.status.riskLabel(row.claimLevel)}
        </span>
        {secondOk && row.firstApprover && (
          <span className="text-xs text-muted-foreground">
            {copy.approvals.firstOkBy(row.firstApprover)}
          </span>
        )}
        <span className="ml-auto text-xs text-muted-foreground"><Stamp at={row.at} /></span>
      </header>

      {editing ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={5}
          className="w-full rounded-md border border-input bg-card p-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      ) : (
        <p className="whitespace-pre-wrap text-sm">{row.finalBody || row.draftBody}</p>
      )}

      {canAct && (
        <footer className="mt-3 flex flex-wrap items-center gap-2">
          {editing ? (
            <>
              <Button
                size="sm"
                disabled={act.isPending || !draft.trim()}
                onClick={() =>
                  act.mutate(
                    { id: row.id, action: 'edit', body: draft.trim() },
                    {
                      onSuccess: () => {
                        setEditing(false);
                        toast({ title: copy.approvals.draftUpdated });
                      },
                      onError,
                    },
                  )
                }
              >
                {copy.approvals.saveEdit}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                {copy.common.cancel}
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                disabled={act.isPending}
                onClick={() =>
                  act.mutate(
                    { id: row.id, action: 'approve' },
                    {
                      onSuccess: () =>
                        toast({
                          title: secondOk ? copy.approvals.secondOkToast : copy.approvals.approvedToast,
                          tone: 'success',
                        }),
                      onError,
                    },
                  )
                }
              >
                {secondOk ? copy.today.giveSecondOk : copy.today.approve}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                {copy.approvals.editFirst}
              </Button>
              <ReasonAction
                label={copy.today.reject}
                placeholder={copy.today.rejectPlaceholder}
                busy={act.isPending}
                onConfirm={(reason) =>
                  act.mutate(
                    { id: row.id, action: 'reject', reason },
                    { onSuccess: () => toast({ title: copy.approvals.rejectedToast }), onError },
                  )
                }
              />
            </>
          )}
        </footer>
      )}
    </article>
  );
}

export function ApprovalsView() {
  const copy = useCopy();
  const queue = useApprovalQueue();
  const { hasPermission } = useAuth();
  const canAct = hasPermission(['ADMIN', 'ASSESSMENT']);

  // The endpoint is a bare newest-first array with no params — risk filter
  // and ordering are ours. Oldest-first is the default: it's a queue.
  const [minRisk, setMinRisk] = useState<number | null>(null);
  const [order, setOrder] = useState<'oldest' | 'newest'>('oldest');
  const rows = (queue.data ?? [])
    .filter((row) => minRisk === null || row.claimLevel >= minRisk)
    .sort((a, b) => (order === 'oldest' ? a.at.localeCompare(b.at) : b.at.localeCompare(a.at)));
  const { visible, remaining, showMore } = useCapped(rows);

  return (
    <section>
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display tracking-display text-2xl font-semibold">
            {copy.approvals.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {copy.approvals.subtitle}
            {!canAct && copy.approvals.watchOnly}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[3, 4, 5].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setMinRisk(minRisk === level ? null : level)}
              aria-pressed={minRisk === level}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium',
                minRisk === level
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:bg-accent',
              )}
            >
              {copy.approvals.riskAtLeast(level)}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setOrder(order === 'oldest' ? 'newest' : 'oldest')}
            className="rounded-md border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-accent"
          >
            {order === 'oldest' ? copy.approvals.oldestFirst : copy.approvals.newestFirst}
          </button>
        </div>
      </header>

      {queue.isLoading && rows.length === 0 ? (
        <div className="glass-surface animate-pulse rounded-xl p-10 text-sm text-muted-foreground">{copy.approvals.loading}</div>
      ) : rows.length === 0 ? (
        <div className="glass-surface rounded-xl p-10 text-center text-sm text-muted-foreground">
          Nothing waiting — the AI has no held drafts right now.
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((row) => (
            <ApprovalCard key={row.id} row={row} canAct={canAct} />
          ))}
          <ShowMore remaining={remaining} onClick={showMore} />
        </div>
      )}
    </section>
  );
}
