import { getCopy } from '@/lib/i18n/server';

import { ApprovalsView } from '@/components/approvals/approvals-view';

export async function generateMetadata() {
  const copy = await getCopy();
  return { title: copy.nav.approvals };
}

export default function ApprovalsPage() {
  return <ApprovalsView />;
}
