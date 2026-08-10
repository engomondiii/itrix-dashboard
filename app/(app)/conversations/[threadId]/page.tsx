import { ThreadView } from '@/components/conversations/thread-view';

export const metadata = { title: 'Transcript' };

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  return <ThreadView threadId={threadId} />;
}
