import { getCopy } from '@/lib/i18n/server';

import { CustomerDetailView } from '@/components/customers/customer-detail-view';

export async function generateMetadata() {
  const copy = await getCopy();
  return { title: copy.conversations.accountTitle };
}

export default async function CustomerPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  return <CustomerDetailView clientId={clientId} />;
}
