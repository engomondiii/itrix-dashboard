import { PageHeader } from "@/components/layout/PageHeader";
import { ConversationList } from "@/components/console/ConversationList";

export default function ConsolePage() {
  return (
    <>
      <PageHeader
        title="Console"
        description="Live client conversations across review, client page, and portal. Team replies are governed exactly like agent output."
      />
      <ConversationList />
    </>
  );
}
