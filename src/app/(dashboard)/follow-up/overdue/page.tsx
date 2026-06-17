import { PageHeader } from "@/components/layout/PageHeader";
import { FollowUpQueue } from "@/components/follow-up/FollowUpQueue";

export default function OverdueFollowUpPage() {
  return (
    <>
      <PageHeader
        title="Overdue follow-ups"
        description="Past their response SLA — action needed."
      />
      <FollowUpQueue filter="overdue" />
    </>
  );
}
