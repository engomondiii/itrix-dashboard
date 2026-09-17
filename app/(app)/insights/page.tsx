import { getCopy } from '@/lib/i18n/server';

import { InsightsView } from '@/components/insights/insights-view';

export async function generateMetadata() {
  const copy = await getCopy();
  return { title: copy.nav.insights };
}

export default function InsightsPage() {
  return <InsightsView />;
}
