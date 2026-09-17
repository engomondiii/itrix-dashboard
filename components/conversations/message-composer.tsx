'use client';

/**
 * The reply-as-a-person composer, shared by the transcript (inline) and the
 * messages route. Reads the send response's governanceStatus rather than
 * predicting it: sent / held for OK / blocked each surface differently.
 */

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { normalizeError } from '@/lib/api/errors';
import { useSendMessage } from '@/lib/conversations/hooks';
import { useCopy } from '@/lib/i18n/locale-provider';

const RISK_OPTIONS = [
  { level: 1 },
  { level: 2 },
  { level: 3 },
  { level: 4 },
  { level: 5 },
];

export function MessageComposer({ conversationId }: { conversationId: string }) {
  const copy = useCopy();
  const { toast } = useToast();
  const send = useSendMessage(conversationId);
  const [draft, setDraft] = useState('');
  const [claimLevel, setClaimLevel] = useState(1);

  return (
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
                toast({ title: copy.conversations.sentToast, tone: 'success' });
              } else if (result.governanceStatus === 'pending') {
                toast({ title: copy.conversations.heldToast });
              } else {
                toast({ title: copy.conversations.blockedByGuard, tone: 'destructive' });
              }
            },
            onError: (error) => toast({ title: normalizeError(error).message, tone: 'destructive' }),
          },
        );
      }}
      className="sticky bottom-4 z-10 mt-6 space-y-2 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-brand-2)]"
    >
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={3}
        placeholder={copy.conversations.replyPlaceholder}
        className="w-full rounded-md border border-input bg-card p-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          Risk
          <select
          value={claimLevel}
          onChange={(e) => setClaimLevel(Number(e.target.value))}
          className="h-8 rounded-md border border-input bg-card px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={copy.conversations.riskAriaLabel}
        >
          {RISK_OPTIONS.map((option) => (
            <option key={option.level} value={option.level}>
              {copy.conversations.riskOption(option.level)}
            </option>
          ))}
          </select>
        </label>
        <span className="hidden text-[11px] text-muted-foreground sm:inline">
          Risk 1–2 send now · Risk 3+ go through Approvals first
        </span>
        <Button type="submit" size="sm" disabled={send.isPending || !draft.trim()}>
          {send.isPending
            ? copy.conversations.sending
            : claimLevel >= 3
              ? copy.conversations.sendForOk
              : copy.conversations.send}
        </Button>
      </div>
    </form>
  );
}
