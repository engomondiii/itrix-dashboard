import { getCopy } from '@/lib/i18n/server';

import { LeadsView } from '@/components/leads/leads-view';

export async function generateMetadata() {
  const copy = await getCopy();
  return { title: copy.nav.leads };
}

export default function LeadsPage() {
  return <LeadsView />;
}
