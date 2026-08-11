'use client';

/**
 * Band 8 — files awaiting review (quarantined or failed scans). Release and
 * quarantine both require a written reason — the server enforces ≥12 chars,
 * so the inline input enforces the same before sending.
 *
 * Action responses are small acks, not rows; the mutation invalidates and
 * the list refetches.
 */

import { useToast } from '@/components/ui/toast';
import { normalizeError } from '@/lib/api/errors';
import { ATTACHMENT_REASON_MIN_CHARS } from '@/lib/today/api';
import { useAttachmentAction, useAttachmentQueue } from '@/lib/today/hooks';
import { formatRelative, formatValue } from '@/lib/entity/format';
import type { AttachmentRow } from '@/lib/today/types';
import { QueueCard } from '../queue-card';
import { ReasonAction } from '../reason-action';
import { TodayBand } from '../today-band';
import { ShowMore, useCapped } from '../use-capped';

function AttachmentCard({ row }: { row: AttachmentRow }) {
  const { toast } = useToast();
  const act = useAttachmentAction();

  function run(action: 'release' | 'quarantine', reason: string) {
    act.mutate(
      { id: row.attachmentId, action, reason },
      {
        onSuccess: () =>
          toast({
            title: action === 'release' ? 'File released' : 'File quarantined',
            tone: 'success',
          }),
        onError: (error) =>
          toast({ title: normalizeError(error).message, tone: 'destructive' }),
      },
    );
  }

  return (
    <QueueCard
      tone={row.status === 'quarantined' ? 'urgent' : 'warn'}
      title={
        <>
          {row.filename}
          <span className="text-muted-foreground">
            {' '}
            · {row.status} · {formatValue(row.bytes, 'number')} bytes
          </span>
        </>
      }
      meta={
        <>
          {row.scanVerdict || 'no scan verdict'}
          {row.riskFlags.length ? ` · flags: ${row.riskFlags.join(', ')}` : ''}
          {row.preNda ? ' · pre-NDA' : ''}
          {' · '}
          {formatRelative(row.createdAt)}
        </>
      }
      actions={
        <>
          {row.status === 'quarantined' && (
            <ReasonAction
              label="Release"
              placeholder={`Why it's safe (≥${ATTACHMENT_REASON_MIN_CHARS} chars)`}
              minChars={ATTACHMENT_REASON_MIN_CHARS}
              busy={act.isPending}
              onConfirm={(reason) => run('release', reason)}
            />
          )}
          {row.status !== 'quarantined' && (
            <ReasonAction
              label="Quarantine"
              placeholder={`Why it's suspect (≥${ATTACHMENT_REASON_MIN_CHARS} chars)`}
              minChars={ATTACHMENT_REASON_MIN_CHARS}
              variant="destructive"
              busy={act.isPending}
              onConfirm={(reason) => run('quarantine', reason)}
            />
          )}
        </>
      }
    />
  );
}

export function AttachmentsBand({ forceOpen = false }: { forceOpen?: boolean }) {
  const queue = useAttachmentQueue();
  const rows = queue.data?.results ?? [];
  const { visible, remaining, showMore } = useCapped(rows);

  return (
    <TodayBand
      forceOpen={forceOpen}
      title="Files awaiting review"
      hint="quarantined or failed scans — oldest first"
      count={rows.length}
      isLoading={queue.isLoading}
      tone="warn"
    >
      {visible.map((row) => (
        <AttachmentCard key={row.attachmentId} row={row} />
      ))}
      <ShowMore remaining={remaining} onClick={showMore} />
    </TodayBand>
  );
}
