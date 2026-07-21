import { PageHeader } from "@/components/layout/PageHeader";
import { SupportRequestDetail } from "@/components/support/SupportRequestDetail";

export default async function SupportRequestPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;

  return (
    <>
      <PageHeader
        title="Support request"
        description="A support reply helps with the problem and stops."
      />
      <SupportRequestDetail requestId={requestId} />
    </>
  );
}