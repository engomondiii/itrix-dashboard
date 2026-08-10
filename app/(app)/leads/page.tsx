import { PageStub } from '@/components/layout/page-stub';

export const metadata = { title: 'Leads' };

export default function LeadsPage() {
  return (
    <PageStub
      title="Leads"
      description="Every lead in one place — work the list or see the funnel as a board."
      planned={[
        'One list with a List ⇄ Board toggle (the board is the pipeline)',
        'Priority (1–4), stage, and NDA-pending as filter chips — not separate pages',
        'Lead detail with deal signals, notes, meetings, and the NDA panel on the same page',
      ]}
    />
  );
}
