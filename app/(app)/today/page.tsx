'use client';

/**
 * Today — the home screen. One prioritized queue of everything that needs a
 * human now, so nobody has to remember which corner of the app to patrol.
 *
 * Placeholder until Phase 3 wires the real bands against the backend:
 *   1. Approvals waiting (incl. "needs a second OK")
 *   2. Overdue follow-ups        5. NDAs in flight
 *   3. Conversations waiting     6. Due today
 *   4. New leads                 7. Support heads-up
 *                                8. Files awaiting review
 */

import { useAuth } from '@/lib/auth/auth-context';
import { PageStub } from '@/components/layout/page-stub';

export default function TodayPage() {
  const { user } = useAuth();

  return (
    <PageStub
      title="Today"
      description={
        user?.email ? `What needs your attention now — signed in as ${user.email}.` : 'What needs your attention now.'
      }
      planned={[
        'Messages the AI needs an OK on, first',
        'Overdue and due-today follow-ups with one-tap done / snooze',
        'Live conversations probably waiting on us',
        'New leads to take, priority first',
        'NDAs in flight, support heads-ups, and files awaiting review',
      ]}
    />
  );
}
