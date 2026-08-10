'use client';

/**
 * Transcript of one cockpit thread. This is the ONE place (besides the
 * approval queue) where held/blocked bodies are visible — the console
 * message plane blanks them.
 *
 * "Reply as a person" appears when a console conversation shares this
 * thread's leadId (the only join the backend exposes); otherwise the note
 * explains why stepping in isn't available.
 */

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { cn } from '@/lib/utils';
import { journeyLabel } from '@/lib/leads/journey-labels';
import { formatRelative } from '@/lib/entity/format';
import { useConversations, useThreadDetail } from '@/lib/conversations/hooks';
import type { GovernanceStatus, SenderKind, ThreadTurn } from '@/lib/conversations/types';

const SENDER_LABEL: Record<SenderKind, string> = {
  visitor: 'Visitor',
  client: 'Customer',
  agent: 'AI',
  team: 'Team',
  system: 'System',
};

const GOVERNANCE_BADGE: Partial<Record<GovernanceStatus, { label: string; className: string }>> = {
  pending: { label: 'held for OK', className: 'bg-warning-soft text-warning' },
  blocked: { label: 'blocked', className: 'bg-destructive-soft text-destructive' },
};

function Turn({ turn }: { turn: ThreadTurn }) {
  const fromUs = turn.senderKind === 'agent' || turn.senderKind === 'team';
  const badge = GOVERNANCE_BADGE[turn.governanceStatus];

  return (
    <li className={cn('flex', fromUs ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[46rem] rounded-xl px-3.5 py-2.5 text-sm',
          fromUs ? 'bg-secondary' : 'glass-surface',
          turn.governanceStatus === 'blocked' && 'opacity-70',
        )}
      >
        <p className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            {SENDER_LABEL[turn.senderKind]}
            {turn.agentKey ? ` · ${turn.agentKey}` : ''}
          </span>
          {badge && (
            <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-semibold', badge.className)}>
              {badge.label}
            </span>
          )}
          <span>{formatRelative(turn.at)}</span>
        </p>
        <p className="whitespace-pre-wrap">{turn.body}</p>
      </div>
    </li>
  );
}

export function ThreadView({ threadId }: { threadId: string }) {
  const thread = useThreadDetail(threadId);
  const conversations = useConversations();

  const detail = thread.data;
  // The only thread ⇄ conversation join the backend exposes is a shared leadId.
  const linkedConversation =
    detail?.leadId != null
      ? (conversations.data ?? []).find((c) => c.leadId === detail.leadId)
      : undefined;

  if (thread.isLoading) {
    return <div className="glass-surface animate-pulse rounded-xl p-10 text-sm text-muted-foreground">Loading…</div>;
  }
  if (!detail) {
    return (
      <p className="text-sm text-muted-foreground">
        Conversation not found. <Link href="/conversations" className="underline">Back to the board.</Link>
      </p>
    );
  }

  return (
    <section className="mx-auto max-w-4xl">
      <header className="mb-5">
        <Link
          href="/conversations"
          className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> All conversations
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display tracking-display text-xl font-semibold">
              {detail.title || 'Untitled conversation'}
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {detail.company || (detail.anonymous ? 'Anonymous visitor' : '')} · {journeyLabel(detail.journeyState)} ·{' '}
              started {formatRelative(detail.createdAt)}
              {detail.leadId && (
                <>
                  {' · '}
                  <Link href={`/leads/${detail.leadId}`} className="underline">
                    open lead
                  </Link>
                </>
              )}
            </p>
          </div>
          {linkedConversation ? (
            <Link
              href={`/conversations/messages/${linkedConversation.id}`}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              Reply as a person
            </Link>
          ) : (
            <span className="text-xs text-muted-foreground">
              No message channel linked{detail.anonymous ? ' (anonymous visitor)' : ''}.
            </span>
          )}
        </div>
      </header>

      <ol className="space-y-3">
        {detail.turns.map((turn) => (
          <Turn key={turn.id} turn={turn} />
        ))}
      </ol>

      {detail.guardHits.length > 0 && (
        <aside className="glass-surface mt-6 rounded-xl border-l-2 border-l-warning p-4">
          <h2 className="font-display tracking-display mb-2 text-sm font-semibold">
            Guard flags <span className="font-sans text-xs font-normal text-muted-foreground">— what the safety net caught</span>
          </h2>
          <ul className="space-y-1.5 text-xs">
            {detail.guardHits.map((hit) => (
              <li key={hit.id}>
                <span className="font-medium">{hit.category}</span>
                <span className="text-muted-foreground">
                  {' '}
                  · {hit.kind} · {formatRelative(hit.at)}
                </span>
                {hit.matchedText && (
                  <span className="mt-0.5 block text-muted-foreground">“{hit.matchedText}”</span>
                )}
              </li>
            ))}
          </ul>
        </aside>
      )}
    </section>
  );
}
