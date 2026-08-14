'use client';

/**
 * Lead detail — the whole story of one lead on one page, so working a lead
 * never means visiting three destinations:
 *
 *   header    identity, priority, score, owner ("Take it"), stage control
 *   company   who they work for, the actionable email, other leads there
 *   signals   Deal signals (cockpit, staff-worded) + suggested next step
 *   NDA       the panel formerly known as the /nda pages — request, send,
 *             mark signed, decline, all in place (404 = "no NDA yet")
 *   notes     composer + list
 *   timeline  activity + meetings, merged newest-first
 *
 * Every lead action returns the full detail body; mutations cache it
 * directly (lib/leads/hooks.ts) so the page updates without a refetch.
 */

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { normalizeError } from '@/lib/api/errors';
import {
  useAddNote,
  useDealSignals,
  useLead,
  useNdaAction,
  useNdaRecord,
  useNextAction,
  useRequestNda,
  useSetStatus,
} from '@/lib/leads/hooks';
import type { LeadStatus } from '@/lib/today/types';
import type { LeadDetail } from '@/lib/leads/types';
import { journeyLabel } from '@/lib/leads/journey-labels';
import { useConversations } from '@/lib/conversations/hooks';
import { useThreadBoard } from '@/lib/today/hooks';
import { ReasonAction } from '@/components/today/reason-action';
import { ShowMore, useCapped } from '@/components/today/use-capped';
import { Panel } from '@/components/shared/panel';
import { Stamp } from '@/components/shared/timestamp';
import { AssignControl } from '@/components/leads/assign-control';
import { CompanyCard } from '@/components/leads/company-card';

const ALL_STAGES: LeadStatus[] = [
  'New', 'Qualifying', 'Contacted', 'Meeting Booked', 'NDA', 'Evaluation',
  'PoC', 'Negotiation', 'Licensed', 'Nurture', 'Closed', 'Lost',
];

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span data-numeric>{value}%</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-brand-accent"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

function Header({ lead }: { lead: LeadDetail }) {
  const { toast } = useToast();
  const setStatus = useSetStatus(lead.id);

  return (
    <header className="mb-5">
      <Link
        href="/leads"
        className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> All leads
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display tracking-display text-2xl font-semibold">
            {lead.company || lead.visitorName || 'Unknown lead'}
          </h1>
          {/* Email moved to the Company card, where it's actionable rather
              than decorative. */}
          <p className="mt-1 text-sm text-muted-foreground">
            {[lead.visitorName, lead.role].filter(Boolean).join(' · ')}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            P{lead.tier} · score {lead.score} · submitted <Stamp at={lead.submittedAt} />
            {lead.productRoute ? ` · ${lead.productRoute}` : ''}
            {lead.journeyState ? ` · ${journeyLabel(lead.journeyState)}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AssignControl leadId={lead.id} owner={lead.owner} />

          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            Stage
            <select
              value={lead.status}
              disabled={setStatus.isPending}
              onChange={(e) =>
                setStatus.mutate(e.target.value as LeadStatus, {
                  onSuccess: () => toast({ title: `Moved to ${e.target.value}`, tone: 'success' }),
                  onError: (err) => toast({ title: normalizeError(err).message, tone: 'destructive' }),
                })
              }
              className="h-8 rounded-md border border-input bg-card px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {ALL_STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </header>
  );
}

function SignalsPanel({ leadId }: { leadId: string }) {
  const signals = useDealSignals(leadId);
  const nextAction = useNextAction(leadId);
  const s = signals.data;

  return (
    <Panel title="Deal signals">
      {!s ? (
        <p className="text-sm text-muted-foreground">{signals.isLoading ? 'Loading…' : 'Unavailable.'}</p>
      ) : (
        <div className="space-y-4">
          {nextAction.data?.primary && (
            <div className="rounded-lg bg-secondary px-3 py-2">
              <p className="text-xs font-medium">Suggested next step</p>
              <p className="text-sm">{nextAction.data.primary.label}</p>
              {nextAction.data.reason && (
                <p className="mt-0.5 text-xs text-muted-foreground">{nextAction.data.reason}</p>
              )}
            </div>
          )}

          <div className="space-y-2.5">
            <Meter label="NDA readiness" value={s.readiness.nda} />
            <Meter label="Evaluation readiness" value={s.readiness.assessment} />
            <Meter label="PoC readiness" value={s.readiness.poc} />
            <Meter label="License-out likelihood" value={s.licenseOutProbability} />
          </div>

          {s.objectionSignals.length > 0 && (
            <div>
              <p className="text-xs font-medium text-warning">Watch for</p>
              <ul className="mt-1 list-disc pl-4 text-xs text-muted-foreground">
                {s.objectionSignals.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </div>
          )}

          {s.pain && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Their problem:</span> {s.pain}
            </p>
          )}
        </div>
      )}
    </Panel>
  );
}

function NdaPanel({ lead }: { lead: LeadDetail }) {
  const { toast } = useToast();
  const nda = useNdaRecord(lead.id);
  const request = useRequestNda(lead.id);
  const act = useNdaAction(lead.id);
  const [signerEmail, setSignerEmail] = useState('');

  const record = nda.data;

  function onError(error: unknown) {
    toast({ title: normalizeError(error).message, tone: 'destructive' });
  }

  return (
    <Panel title="NDA">
      {nda.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !record ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">No NDA yet.</p>
          <Button
            size="sm"
            disabled={request.isPending}
            onClick={() =>
              request.mutate(undefined, {
                onSuccess: () => toast({ title: 'NDA requested', tone: 'success' }),
                onError,
              })
            }
          >
            Request NDA
          </Button>
        </div>
      ) : (
        <div className="space-y-3 text-sm">
          <p>
            <span className={cn(
              'rounded-full px-2 py-0.5 text-xs font-semibold',
              record.status === 'signed' && 'bg-positive-soft text-positive',
              record.status === 'sent' && 'bg-warning-soft text-warning',
              record.status === 'required' && 'bg-secondary text-secondary-foreground',
              (record.status === 'declined' || record.status === 'expired') && 'bg-destructive-soft text-destructive',
            )}>
              {record.status === 'required' ? 'needs sending' : record.status}
            </span>
            <span className="ml-2 text-xs text-muted-foreground">{record.docType}</span>
          </p>

          {record.status === 'required' && (
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="email"
                value={signerEmail}
                onChange={(e) => setSignerEmail(e.target.value)}
                placeholder="Signer's email"
                className="h-8 w-52 rounded-md border border-input bg-card px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <Button
                size="sm"
                disabled={act.isPending || !signerEmail.includes('@')}
                onClick={() =>
                  act.mutate(
                    { action: 'send', signerEmail },
                    { onSuccess: () => toast({ title: 'NDA sent', tone: 'success' }), onError },
                  )
                }
              >
                Send
              </Button>
            </div>
          )}

          {record.status === 'sent' && (
            <div className="flex flex-wrap items-center gap-2">
              <p className="w-full text-xs text-muted-foreground">
                Sent <Stamp at={record.sentAt} fallback="" /> to {record.signerEmail}
              </p>
              <Button
                size="sm"
                disabled={act.isPending}
                onClick={() =>
                  act.mutate(
                    { action: 'sign' },
                    { onSuccess: () => toast({ title: 'Marked signed', tone: 'success' }), onError },
                  )
                }
              >
                Mark signed
              </Button>
              <ReasonAction
                label="Mark declined"
                placeholder="Their stated reason"
                minChars={1}
                busy={act.isPending}
                onConfirm={(reason) =>
                  act.mutate(
                    { action: 'decline', reason },
                    { onSuccess: () => toast({ title: 'Marked declined' }), onError },
                  )
                }
              />
            </div>
          )}

          {record.status === 'signed' && record.signedAt && (
            <p className="text-xs text-muted-foreground">Signed <Stamp at={record.signedAt} />.</p>
          )}
          {record.status === 'declined' && record.declineReason && (
            <p className="text-xs text-muted-foreground">Reason: {record.declineReason}</p>
          )}
        </div>
      )}
    </Panel>
  );
}

/** Prettify a qualification key: "q1" → "Q1", "decision_process" → "Decision process". */
function qualLabel(key: string): string {
  if (/^q\d+$/i.test(key)) return key.toUpperCase();
  const spaced = key.replace(/_/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Everything the lead told us and everything the system derived — the full
 * briefing, so staff never have to wonder what's known about this person.
 * Empty fields are simply omitted; no dash-filled skeletons.
 */
function AboutPanel({ lead }: { lead: LeadDetail }) {
  const facts: Array<[string, React.ReactNode]> = [];
  const add = (label: string, value: React.ReactNode) => {
    if (value !== null && value !== undefined && value !== '') facts.push([label, value]);
  };

  add('Industry', lead.industry);
  add('Their problem', lead.primaryPain);
  add('Compute bottleneck', lead.computeBottleneck);
  add('Workload', lead.workloadType);
  add(
    'Current stack',
    lead.currentStack.length > 0 ? (
      <span className="flex flex-wrap gap-1">
        {lead.currentStack.map((tool) => (
          <span key={tool} className="rounded-full bg-secondary px-2 py-0.5 text-[11px]">
            {tool}
          </span>
        ))}
      </span>
    ) : (
      ''
    ),
  );
  add('Commercial intent', lead.commercialIntent);
  add('Timeline', lead.timeline);
  add('Product route', lead.productRoute);
  add('Commercial path', lead.commercialPath);
  if (lead.specialRights && lead.specialRights !== 'None') add('Special rights', lead.specialRights);

  const breakdown = Object.entries(lead.scoreBreakdown).filter(
    ([, v]) => typeof v === 'number' || typeof v === 'string',
  );
  if (breakdown.length > 0) {
    add(
      'Score breakdown',
      breakdown.map(([k, v]) => `${qualLabel(k)} ${String(v)}`).join(' · '),
    );
  }

  const engagement = [
    lead.documentsViewed > 0 ? `${lead.documentsViewed} document${lead.documentsViewed === 1 ? '' : 's'} viewed` : null,
    lead.ctaClicked ? 'clicked the call-to-action' : null,
    lead.humanHandoffTrigger ? 'asked for a human' : null,
    lead.valueDelivered ? 'value delivered' : null,
  ].filter(Boolean);
  if (engagement.length > 0) add('Engagement', engagement.join(' · '));

  if (lead.recommendedNextStep) add('System suggestion', lead.recommendedNextStep);

  const answers = Object.entries(lead.qualification).filter(([, v]) => typeof v === 'string' && v !== '');

  if (facts.length === 0 && answers.length === 0) return null;

  return (
    <Panel title="About this lead">
      <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
            <dd className="mt-0.5">{value}</dd>
          </div>
        ))}
      </dl>
      {answers.length > 0 && (
        <div className="mt-4 border-t border-border/60 pt-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            What they told the AI during qualification
          </p>
          <dl className="space-y-1.5 text-sm">
            {answers.map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <dt className="w-10 shrink-0 text-xs font-semibold text-muted-foreground">{qualLabel(key)}</dt>
                <dd className="min-w-0">{String(value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </Panel>
  );
}

function ConversationsPanel({ lead }: { lead: LeadDetail }) {
  // The transcript already links thread → lead; this closes the loop the
  // other way so working a lead never means hunting the Conversations board.
  const board = useThreadBoard();
  const conversations = useConversations();
  // One person can have MANY chats (each client-page visit can open one) —
  // list them all, newest activity first.
  const threads = (board.data?.results ?? [])
    .filter((t) => t.leadId === lead.id)
    .sort((a, b) => (b.lastActivityAt ?? b.createdAt).localeCompare(a.lastActivityAt ?? a.createdAt));
  const leadConversations = (conversations.data ?? []).filter((c) => c.leadId === lead.id);

  return (
    <Panel title={`Conversations${threads.length > 1 ? ` (${threads.length})` : ''}`}>
      {threads.length === 0 && leadConversations.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nothing linked to this lead yet — a conversation attaches once the visitor&apos;s
          thread is qualified.{' '}
          <Link href="/conversations" className="underline">
            Browse all conversations
          </Link>
          .
        </p>
      )}
      <div className="space-y-2 text-sm">
        {threads.map((thread) => (
          <div key={thread.threadId} className="flex flex-wrap items-center gap-2">
            <Link href={`/conversations/${thread.threadId}`} className="min-w-0 flex-1 truncate hover:underline">
              {thread.title || 'Untitled conversation'}
            </Link>
            <span className="text-xs text-muted-foreground">
              {thread.visitorTurns} visitor {thread.visitorTurns === 1 ? 'turn' : 'turns'} ·{' '}
              <Stamp at={thread.lastActivityAt ?? thread.createdAt} />
            </span>
            <Link
              href={`/conversations/${thread.threadId}`}
              className="rounded-md border border-border px-2 py-0.5 text-xs hover:bg-accent"
            >
              Open &amp; reply
            </Link>
          </div>
        ))}
        {/* Message channels with no visible thread (portal/console contexts). */}
        {leadConversations
          .filter((c) => !threads.some((t) => t.title.trim() === c.title.trim()))
          .map((c) => (
            <div key={c.id} className="flex flex-wrap items-center gap-2">
              <Link
                href={`/conversations/messages/${c.id}`}
                className="min-w-0 flex-1 truncate hover:underline"
              >
                {c.title || 'Messages'}
              </Link>
              {c.lastMessageAt && (
                <span className="text-xs text-muted-foreground"><Stamp at={c.lastMessageAt} /></span>
              )}
              <Link
                href={`/conversations/messages/${c.id}`}
                className="rounded-md border border-border px-2 py-0.5 text-xs hover:bg-accent"
              >
                Reply
              </Link>
            </div>
          ))}
      </div>
    </Panel>
  );
}

function NotesPanel({ lead }: { lead: LeadDetail }) {
  const { toast } = useToast();
  const addNote = useAddNote(lead.id);
  const [draft, setDraft] = useState('');
  const notesCap = useCapped(lead.notes);

  return (
    <Panel title="Notes">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const body = draft.trim();
          if (!body) return;
          addNote.mutate(body, {
            onSuccess: () => setDraft(''),
            onError: (err) => toast({ title: normalizeError(err).message, tone: 'destructive' }),
          });
        }}
        className="mb-3 flex gap-2"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a note…"
          className="h-8 min-w-0 flex-1 rounded-md border border-input bg-card px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button type="submit" size="sm" disabled={addNote.isPending || !draft.trim()}>
          Add
        </Button>
      </form>
      {lead.notes.length === 0 ? (
        <p className="text-xs text-muted-foreground">No notes yet.</p>
      ) : (
        <ul className="space-y-2">
          {notesCap.visible.map((note) => (
            <li key={note.id} className="rounded-lg bg-muted/60 px-3 py-2 text-sm">
              <p>{note.body}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {note.author} · <Stamp at={note.createdAt} />
              </p>
            </li>
          ))}
          <ShowMore remaining={notesCap.remaining} onClick={notesCap.showMore} />
        </ul>
      )}
    </Panel>
  );
}

function TimelinePanel({ lead }: { lead: LeadDetail }) {
  const entries = [
    ...lead.activity.map((a) => ({
      id: `a-${a.id}`,
      at: a.at,
      text: a.label,
      by: a.by,
    })),
    ...lead.meetings.map((m) => ({
      id: `m-${m.id}`,
      at: m.scheduledAt,
      text: `Meeting${m.attendee ? ` with ${m.attendee}` : ''}${m.location ? ` · ${m.location}` : ''} (${m.durationMins} min)`,
      by: m.bookedBy || null,
    })),
  ].sort((a, b) => b.at.localeCompare(a.at));
  const cap = useCapped(entries);

  return (
    <Panel title="History">
      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nothing yet.</p>
      ) : (
        <ul className="space-y-1.5">
          {cap.visible.map((entry) => (
            <li key={entry.id} className="flex items-baseline gap-2 text-sm">
              <span className="w-20 shrink-0 text-xs text-muted-foreground" title={entry.at}>
                <Stamp at={entry.at} />
              </span>
              <span className="min-w-0">
                {entry.text}
                {entry.by && <span className="text-xs text-muted-foreground"> — {entry.by}</span>}
              </span>
            </li>
          ))}
          <ShowMore remaining={cap.remaining} onClick={cap.showMore} />
        </ul>
      )}
    </Panel>
  );
}

export function LeadDetailView({ leadId }: { leadId: string }) {
  const lead = useLead(leadId);

  if (lead.isLoading) {
    return <div className="glass-surface animate-pulse rounded-xl p-10 text-sm text-muted-foreground">Loading…</div>;
  }
  if (!lead.data) {
    return (
      <div>
        <p className="text-sm text-muted-foreground">
          Lead not found. <Link href="/leads" className="underline">Back to all leads.</Link>
        </p>
      </div>
    );
  }

  const detail = lead.data;

  return (
    <div>
      <Header lead={detail} />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-4">
          <AboutPanel lead={detail} />
          <ConversationsPanel lead={detail} />
          <NotesPanel lead={detail} />
          <TimelinePanel lead={detail} />
        </div>
        <div className="min-w-0 space-y-4">
          <CompanyCard lead={detail} />
          <SignalsPanel leadId={detail.id} />
          <NdaPanel lead={detail} />
        </div>
      </div>
    </div>
  );
}
