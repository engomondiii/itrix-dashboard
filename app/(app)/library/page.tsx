import { PageStub } from '@/components/layout/page-stub';

export const metadata = { title: 'Library' };

export default function LibraryPage() {
  return (
    <PageStub
      title="Library"
      description="The reference shelf: message templates and buyer profiles."
      planned={[
        'Message templates with variable substitution (email, follow-up, evaluation, PoC, handoff)',
        'Buyer profiles — internal only, never shared with customers',
      ]}
    />
  );
}
