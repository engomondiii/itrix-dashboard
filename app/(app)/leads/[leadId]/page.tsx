import { getCopy } from '@/lib/i18n/server';

import { LeadDetailView } from '@/components/leads/lead-detail-view';

export async function generateMetadata() {
  const copy = await getCopy();
  return { title: copy.today.leadFallback };
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;
  return <LeadDetailView leadId={leadId} />;
}
