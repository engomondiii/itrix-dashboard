import { PageHeader } from "@/components/layout/PageHeader";
import { FollowUpQueue } from "@/components/follow-up/FollowUpQueue";

export default function TodayFollowUpPage() {
  return (
    <>
      <PageHeader title="Due today" description="Follow-ups with an SLA deadline today." />
      <FollowUpQueue filter="today" />
    </>
  );
}
