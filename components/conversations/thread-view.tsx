'use client';

/**
 * Transcript of one cockpit thread — the ONE conversation surface: reading
 * AND replying happen here.
 *
 * Two backend planes feed it. Thread turns carry the real bodies (including
 * held/blocked drafts) but — a known backend gap — never the team's own
 * console replies; console messages carry the team replies but blank held
 * bodies. Both are rows of the same Message table with the same ids, so the
 * view merges them: thread version wins per id, console-only rows fill the
 * gaps, ordered by time.
 *
 * The thread → conversation join is leadId when the backend provides one;
 * for anonymous visitors there is no join field at all, so we fall back to
 * an exact title match (both titles derive from the same first message).
 */

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { cn } from '@/lib/utils';
import { journeyLabel } from '@/lib/leads/journey-labels';
import { formatRelative } from '@/lib/entity/format';
import { useConversation, useConversations, useThreadDetail } from '@/lib/conversations/hooks';
import type {
  ConversationSummary,
  GovernanceStatus,
  SenderKind,
  ThreadDetail,
  ThreadTurn,
} from '@/lib/conversations/types';
import { MessageComposer } from './message-composer';

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
        {turn.governanceStatus === 'pending' && !turn.body ? (
          <p className="italic text-muted-foreground">Held for a human OK — the draft is in Approvals.</p>
        ) : (
          <p className="whitespace-pre-wrap">{turn.body}</p>
        )}
      </div>
    </li>
  );
}

/** leadId join first; exact-title fallback for anonymous conversations. */
function findLinked(
  detail: ThreadDetail | undefined,
  conversations: ConversationSummary[],
): ConversationSummary | undefined {
  if (!detail) return undefined;
  if (detail.leadId != null) {
    const byLead = conversations.find((c) => c.leadId === detail.leadId);
    if (byLead) return byLead;
  }
  const title = detail.title.trim().toLowerCase();
  if (!title) return undefined;
  return conversations.find((c) => c.title.trim().toLowerCase() === title);
}

/** Merge planes by message id: thread turn wins; console-only rows fill in. */
function mergedTurns(
  detail: ThreadDetail,
  consoleMessages: Array<{
    id: string;
    senderKind: SenderKind;
    agentKey: string | null;
    body: string;
    governanceStatus: GovernanceStatus;
    underReview: boolean;
    at: string;
  }>,
): ThreadTurn[] {
  const seen = new Set(detail.turns.map((t) => t.id));
  const extras: ThreadTurn[] = consoleMessages
    .filter((m) => !seen.has(m.id))
    .map((m) => ({
      id: m.id,
      seq: Number.MAX_SAFE_INTEGER,
      senderKind: m.senderKind,
      agentKey: m.agentKey,
      body: m.underReview && !m.body ? '' : m.body,
      governanceStatus: m.underReview ? 'pending' : m.governanceStatus,
      claimLevel: 0,
      streamingStatus: 'settled',
      citedChunkIds: [],
      at: m.at,
    }));
  return [...detail.turns, ...extras].sort((a, b) => a.at.localeCompare(b.at));
}

export function ThreadView({ threadId }: { threadId: string }) {
  const thread = useThreadDetail(threadId);
  const conversations = useConversations();

  const detail = thread.data;
  const linkedConversation = findLinked(detail, conversations.data ?? []);
  const conversation = useConversation(linkedConversation?.id ?? '');
  const turns =
    detail && linkedConversation && conversation.data
      ? mergedTurns(detail, conversation.data.messages)
      : (detail?.turns ?? []);

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
    <section>
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
        </div>
      </header>

      <ol className="space-y-3">
        {turns.map((turn) => (
          <Turn key={turn.id} turn={turn} />
        ))}
      </ol>

      {linkedConversation ? (
        <MessageComposer conversationId={linkedConversation.id} />
      ) : (
        <p className="mt-6 text-xs text-muted-foreground">
          Replying isn&apos;t possible here yet — the backend exposes no message channel for this
          conversation{detail.anonymous ? ' (anonymous visitor, no matching title found)' : ''}.
        </p>
      )}

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
