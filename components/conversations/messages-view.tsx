'use client';

/**
 * Step in as a person: the console message plane for one conversation.
 *
 * Contract realities encoded here:
 *  - held/blocked bodies come back "" on this plane — render a placeholder
 *    off `underReview` (the transcript view has the real text)
 *  - a message at risk level 3+ is HELD for approval (server-tunable), so we
 *    read the response's governanceStatus rather than predicting: sent /
 *    held for OK / blocked each toast differently
 */

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { normalizeError } from '@/lib/api/errors';
import { formatRelative } from '@/lib/entity/format';
import { useConversation, useSendMessage } from '@/lib/conversations/hooks';
import type { ConsoleMessage } from '@/lib/conversations/types';
import { MessageBody } from './message-body';

const RISK_OPTIONS = [
  { level: 1, label: 'Risk 1 · conversational' },
  { level: 2, label: 'Risk 2 · qualitative' },
  { level: 3, label: 'Risk 3 · needs citation (held for OK)' },
  { level: 4, label: 'Risk 4 · commercial (held, 2 OKs)' },
  { level: 5, label: 'Risk 5 · legal (held, 2 OKs)' },
];

function Message({ message }: { message: ConsoleMessage }) {
  const fromUs = message.senderKind === 'agent' || message.senderKind === 'team';
  return (
    <li className={cn('flex', fromUs ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[42rem] rounded-xl px-3.5 py-2.5 text-sm break-words', fromUs ? 'bg-secondary' : 'glass-surface')}>
        <p className="mb-1 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            {message.senderKind === 'team' ? 'Team' : message.senderKind === 'agent' ? 'AI' : 'Visitor'}
          </span>{' '}
          · {formatRelative(message.at)}
        </p>
        {message.underReview && !message.body ? (
          <p className="italic text-muted-foreground">
            Held for a human OK — see Approvals for the draft.
          </p>
        ) : (
          <MessageBody text={message.body} />
        )}
      </div>
    </li>
  );
}

export function MessagesView({ conversationId }: { conversationId: string }) {
  const { toast } = useToast();
  const conversation = useConversation(conversationId);
  const send = useSendMessage(conversationId);
  const [draft, setDraft] = useState('');
  const [claimLevel, setClaimLevel] = useState(1);
  const [shown, setShown] = useState(50);

  const detail = conversation.data;

  if (conversation.isLoading) {
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
        <h1 className="font-display tracking-display text-xl font-semibold">
          {detail.title || 'Messages'}
        </h1>
        {detail.leadId && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            <Link href={`/leads/${detail.leadId}`} className="underline">
              open lead
            </Link>
          </p>
        )}
      </header>

      {detail.messages.length > shown && (
        <button
          type="button"
          onClick={() => setShown((n) => n + 100)}
          className="mb-3 w-full rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent"
        >
          Show {Math.min(detail.messages.length - shown, 100)} earlier messages
        </button>
      )}
      <ol className="space-y-3">
        {detail.messages.slice(-shown).map((message) => (
          <Message key={message.id} message={message} />
        ))}
      </ol>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const body = draft.trim();
          if (!body) return;
          send.mutate(
            { body, claimLevel },
            {
              onSuccess: (result) => {
                setDraft('');
                if (result.governanceStatus === 'auto_approved') {
                  toast({ title: 'Sent', tone: 'success' });
                } else if (result.governanceStatus === 'pending') {
                  toast({ title: 'Held for an OK — it will send once approved' });
                } else {
                  toast({ title: 'Blocked by the language guard — rephrase and try again', tone: 'destructive' });
                }
              },
              onError: (error) => toast({ title: normalizeError(error).message, tone: 'destructive' }),
            },
          );
        }}
        className="glass-surface sticky bottom-4 mt-6 space-y-2 rounded-xl p-3"
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="Reply as a person…"
          className="w-full rounded-md border border-input bg-card p-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <select
            value={claimLevel}
            onChange={(e) => setClaimLevel(Number(e.target.value))}
            className="h-8 rounded-md border border-input bg-card px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Risk level of this message"
          >
            {RISK_OPTIONS.map((option) => (
              <option key={option.level} value={option.level}>
                {option.label}
              </option>
            ))}
          </select>
          <Button type="submit" size="sm" disabled={send.isPending || !draft.trim()}>
            {send.isPending ? 'Sending…' : claimLevel >= 3 ? 'Send for OK' : 'Send'}
          </Button>
        </div>
      </form>
    </section>
  );
}
