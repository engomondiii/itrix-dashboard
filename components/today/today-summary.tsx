'use client';

/**
 * The queue at a glance AND its filter: one chip per band with a live,
 * scope-aware count. Clicking focuses the queue on that band alone (forced
 * open); clicking again returns to the full banded view. With nothing
 * focused, the priority order still tells the whole story.
 *
 * Zero-cost data-wise: it consumes the same react-query caches the bands
 * poll — no extra requests.
 */

import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/auth-context';
import {
  useApprovalQueue,
  useAttachmentQueue,
  useFollowUp,
  useNdaInFlight,
  useNewLeads,
  useSupportQueue,
  useThreadBoard,
} from '@/lib/today/hooks';
import { inScope, isProbablyWaiting, type TodayScope } from './scope';

export function TodaySummary({
  scope,
  focus,
  onFocus,
}: {
  scope: TodayScope;
  focus: string | null;
  onFocus: (id: string | null) => void;
}) {
  const { user } = useAuth();
  const approvals = useApprovalQueue();
  const overdue = useFollowUp('overdue');
  const dueToday = useFollowUp('today');
  const board = useThreadBoard();
  const leads = useNewLeads();
  const nda = useNdaInFlight();
  const support = useSupportQueue();
  const attachments = useAttachmentQueue();

  const scoped = <T,>(rows: T[], owner: (row: T) => string | null | undefined) =>
    rows.filter((row) => inScope(scope, owner(row), user?.name)).length;

  const chips: Array<{ id: string; label: string; count: number; tone: 'urgent' | 'warn' | 'neutral' }> = [
    { id: 'band-approvals', label: 'Approvals', count: (approvals.data ?? []).length, tone: 'urgent' },
    {
      id: 'band-overdue',
      label: 'Overdue',
      count: scoped(overdue.data?.results ?? [], (r) => r.owner),
      tone: 'urgent',
    },
    {
      id: 'band-waiting',
      label: 'Waiting',
      count: (board.data?.results ?? []).filter(isProbablyWaiting).length,
      tone: 'warn',
    },
    {
      id: 'band-leads',
      label: 'New leads',
      count: scoped(leads.data?.results ?? [], (r) => r.owner),
      tone: 'neutral',
    },
    { id: 'band-nda', label: 'NDAs', count: nda.data?.results.length ?? 0, tone: 'neutral' },
    {
      id: 'band-due-today',
      label: 'Due today',
      count: scoped(dueToday.data?.results ?? [], (r) => r.owner),
      tone: 'neutral',
    },
    {
      id: 'band-support',
      label: 'Support',
      count: scoped(support.data?.results ?? [], (r) => r.owner),
      tone: 'warn',
    },
    { id: 'band-files', label: 'Files', count: attachments.data?.results.length ?? 0, tone: 'warn' },
  ];

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          role="tab"
          aria-selected={focus === chip.id}
          onClick={() => onFocus(focus === chip.id ? null : chip.id)}
          disabled={chip.count === 0 && focus !== chip.id}
          className={cn(
            'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium disabled:opacity-45',
            focus === chip.id
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-card hover:bg-accent disabled:hover:bg-card',
          )}
        >
          {chip.label}
          <span
            className={cn(
              'rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
              chip.count === 0
                ? 'bg-muted text-muted-foreground'
                : chip.tone === 'urgent'
                  ? 'bg-destructive/10 text-destructive'
                  : chip.tone === 'warn'
                    ? 'bg-warning-soft text-warning'
                    : 'bg-secondary text-secondary-foreground',
            )}
            data-numeric
          >
            {chip.count}
          </span>
        </button>
      ))}
    </div>
  );
}
