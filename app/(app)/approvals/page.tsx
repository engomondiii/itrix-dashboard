import { PageStub } from '@/components/layout/page-stub';

export const metadata = { title: 'Approvals' };

export default function ApprovalsPage() {
  return (
    <PageStub
      title="Approvals"
      description="Messages the AI wants to send that need a human OK before they go out."
      planned={[
        'The queue, oldest first, with the draft, its risk level, and the linked lead',
        'Approve, edit-then-approve, or reject with a reason',
        'High-risk claims show “Approve (1 of 2)” — a second teammate confirms',
        'An AI activity tab: what the agents did and when',
      ]}
    />
  );
}
