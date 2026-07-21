import { PageHeader } from "@/components/layout/PageHeader";
import { ThreadBoard } from "@/components/threads/ThreadBoard";

export default function ThreadsPage() {
  return (
    <>
      <PageHeader
        title="Threads"
        description="Every conversation in flight, from the visitor’s first sentence — anonymous, identified and customer. Blocked and live threads are listed first."
      />
      <ThreadBoard />
    </>
  );
}
