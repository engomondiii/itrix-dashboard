import { PageStub } from '@/components/layout/page-stub';

export const metadata = { title: 'Customers' };

export default function CustomersPage() {
  return (
    <PageStub
      title="Customers"
      description="Every account in one hub — health, lifecycle stage, and open support at a glance."
      planned={[
        'One list: company, health (with reasons), stage — Evaluating / PoC / Licensed',
        'Account page with tabs: Overview · Deals · Support · History',
        'Evaluation KPIs and PoC milestones editable in place',
      ]}
    />
  );
}
