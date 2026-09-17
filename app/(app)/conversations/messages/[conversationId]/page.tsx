import { getCopy } from '@/lib/i18n/server';

import { MessagesView } from '@/components/conversations/messages-view';

export async function generateMetadata() {
  const copy = await getCopy();
  return { title: copy.conversations.messagesFallback };
}

export default async function MessagesPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  return <MessagesView conversationId={conversationId} />;
}
