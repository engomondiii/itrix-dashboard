import { PageHeader } from "@/components/layout/PageHeader";
import { SuccessReviewScheduler } from "@/components/customers/SuccessReviewScheduler";

export default function SuccessReviewsPage() {
  return (
    <>
      <PageHeader
        title="Success reviews"
        description="Scheduled reviews and the agenda assembled for each — worst first, so the hard part is not left to the end."
      />
      <SuccessReviewScheduler />
    </>
  );
}