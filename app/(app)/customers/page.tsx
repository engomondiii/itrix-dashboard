import { getCopy } from '@/lib/i18n/server';

import { CustomersView } from '@/components/customers/customers-view';

export async function generateMetadata() {
  const copy = await getCopy();
  return { title: copy.nav.customers };
}

export default function CustomersPage() {
  return <CustomersView />;
}
