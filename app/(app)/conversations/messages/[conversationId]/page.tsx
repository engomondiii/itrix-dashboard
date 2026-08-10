import { MessagesView } from '@/components/conversations/messages-view';

export const metadata = { title: 'Messages' };

export default async function MessagesPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  return <MessagesView conversationId={conversationId} />;
}
