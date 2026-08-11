'use client';

/**
 * Today — the home screen. One prioritized queue of everything that needs a
 * human now, so nobody has to remember which corner of the app to patrol.
 *
 * Band order IS the priority order. Multi-staff reality: the scope toggle
 * defaults to "Mine + unassigned" so two people working the queue aren't
 * staring at (and grabbing) each other's items; "Everyone" is the stand-up
 * view. Bands cap what they render (use-capped) — at 100 items per band the
 * counts tell the story and the cards are for the top of the pile.
 *
 * Every band polls independently at 30s, so work a teammate claims
 * disappears within half a minute; conflicting actions surface as error
 * toasts from the backend (e.g. the L4/L5 duplicate-approver 409).
 */

import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/auth-context';
import { ApprovalsBand } from '@/components/today/bands/approvals-band';
import { AttachmentsBand } from '@/components/today/bands/attachments-band';
import { FollowUpBand } from '@/components/today/bands/follow-up-band';
import { NewLeadsBand } from '@/components/today/bands/leads-band';
import { NdaBand } from '@/components/today/bands/nda-band';
import { SupportBand } from '@/components/today/bands/support-band';
import { ThreadsBand } from '@/components/today/bands/threads-band';
import type { TodayScope } from '@/components/today/scope';
import { TodaySummary } from '@/components/today/today-summary';
import { useStoredState } from '@/components/today/use-stored';

export default function TodayPage() {
  const { user } = useAuth();
  const firstName = user?.name?.split(/\s+/)[0];

  const [storedScope, changeScope] = useStoredState('today.scope', 'mine');
  const scope: TodayScope = storedScope === 'all' ? 'all' : 'mine';

  return (
    <section>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display tracking-display text-2xl font-semibold">Today</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {firstName ? `${firstName} — what` : 'What'} needs your attention now, most urgent
            first.
          </p>
        </div>
        <div className="flex rounded-lg border border-border p-0.5" role="group" aria-label="Whose work to show">
          {(
            [
              ['mine', 'Mine + unassigned'],
              ['all', 'Everyone'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => changeScope(value)}
              aria-pressed={scope === value}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium',
                scope === value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <TodaySummary scope={scope} />

      <div id="band-approvals"><ApprovalsBand /></div>
      <div id="band-overdue"><FollowUpBand scope="overdue" ownerScope={scope} /></div>
      <div id="band-waiting"><ThreadsBand /></div>
      <div id="band-leads"><NewLeadsBand ownerScope={scope} /></div>
      <div id="band-nda"><NdaBand /></div>
      <div id="band-due-today"><FollowUpBand scope="today" ownerScope={scope} /></div>
      <div id="band-support"><SupportBand ownerScope={scope} /></div>
      <div id="band-files"><AttachmentsBand /></div>
    </section>
  );
}
