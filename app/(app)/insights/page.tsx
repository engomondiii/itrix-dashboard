import { PageStub } from '@/components/layout/page-stub';

export const metadata = { title: 'Insights' };

export default function InsightsPage() {
  return (
    <PageStub
      title="Insights"
      description="How we're doing — the few numbers that matter, on one page."
      planned={[
        'Funnel: visitors → leads → NDA → evaluation → licensed, with conversion rates',
        'Response time against our own bar',
        'Won / lost and weekly volume KPIs',
      ]}
    />
  );
}
