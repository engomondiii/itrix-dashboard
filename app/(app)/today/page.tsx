'use client';

/**
 * Today — the home screen. One prioritized queue of everything that needs a
 * human now, so nobody has to remember which corner of the app to patrol.
 *
 * Band order IS the priority order (a banded queue, not a scoring
 * algorithm a small team can't explain):
 *   1. Approvals — a customer-facing message is blocked on us
 *   2. Overdue follow-ups
 *   3. Conversations probably waiting
 *   4. New leads (priority first)     6. Due today
 *   5. NDAs in flight                 7. Support heads-up (read-only)
 *                                     8. Files awaiting review
 *
 * Every band polls independently at 30s; one slow domain never blocks the
 * rest. Bands hide themselves when empty — except approvals, where "nothing
 * waiting" is worth saying.
 */

import { useAuth } from '@/lib/auth/auth-context';
import { ApprovalsBand } from '@/components/today/bands/approvals-band';
import { AttachmentsBand } from '@/components/today/bands/attachments-band';
import { FollowUpBand } from '@/components/today/bands/follow-up-band';
import { NewLeadsBand } from '@/components/today/bands/leads-band';
import { NdaBand } from '@/components/today/bands/nda-band';
import { SupportBand } from '@/components/today/bands/support-band';
import { ThreadsBand } from '@/components/today/bands/threads-band';

export default function TodayPage() {
  const { user } = useAuth();
  const firstName = user?.name?.split(/\s+/)[0];

  return (
    <section className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Today</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {firstName ? `${firstName} — what` : 'What'} needs your attention now, most urgent
          first.
        </p>
      </header>

      <ApprovalsBand />
      <FollowUpBand scope="overdue" />
      <ThreadsBand />
      <NewLeadsBand />
      <NdaBand />
      <FollowUpBand scope="today" />
      <SupportBand />
      <AttachmentsBand />
    </section>
  );
}
