import { LeadDetailView } from '@/components/leads/lead-detail-view';

export const metadata = { title: 'Lead' };

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;
  return <LeadDetailView leadId={leadId} />;
}
