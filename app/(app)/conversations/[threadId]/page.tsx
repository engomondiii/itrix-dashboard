import { getCopy } from '@/lib/i18n/server';

import { ThreadView } from '@/components/conversations/thread-view';

export async function generateMetadata() {
  const copy = await getCopy();
  return { title: copy.conversations.transcriptTitle };
}

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  return <ThreadView threadId={threadId} />;
}
