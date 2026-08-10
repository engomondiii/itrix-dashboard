import { CustomerDetailView } from '@/components/customers/customer-detail-view';

export const metadata = { title: 'Account' };

export default async function CustomerPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  return <CustomerDetailView clientId={clientId} />;
}
