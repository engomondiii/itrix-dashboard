import { PageHeader } from "@/components/layout/PageHeader";
import { SupportQueue } from "@/components/support/SupportQueue";

export default function SupportPage() {
  return (
    <>
      <PageHeader
        title="Support"
        description="Open requests with live SLA timers, breaching first. A blocking request suppresses every commercial action for that customer until it clears."
      />
      <SupportQueue />
    </>
  );
}