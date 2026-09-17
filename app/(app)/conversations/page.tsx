import { getCopy } from '@/lib/i18n/server';

import { ConversationsView } from '@/components/conversations/conversations-view';

export async function generateMetadata() {
  const copy = await getCopy();
  return { title: copy.nav.conversations };
}

export default function ConversationsPage() {
  return <ConversationsView />;
}
