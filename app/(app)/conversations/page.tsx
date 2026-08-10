import { PageStub } from '@/components/layout/page-stub';

export const metadata = { title: 'Conversations' };

export default function ConversationsPage() {
  return (
    <PageStub
      title="Conversations"
      description="Watch the AI talk to visitors, live — and step in when a human should."
      planned={[
        'Live board grouped by Active now / Waiting on us / Quiet',
        'Full transcript one click from any conversation',
        'Step in to reply as a person (risky replies route through Approvals automatically)',
      ]}
    />
  );
}
