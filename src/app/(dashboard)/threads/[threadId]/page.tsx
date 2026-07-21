import { PageHeader } from "@/components/layout/PageHeader";
import { ThreadTranscript } from "@/components/threads/ThreadTranscript";

export default async function ThreadDetailPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;

  return (
    <>
      <PageHeader
        title="Thread"
        description="The transcript as the visitor saw it, plus the internal overlay they never see."
      />
      <ThreadTranscript threadId={threadId} />
    </>
  );
}
