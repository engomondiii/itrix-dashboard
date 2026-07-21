import { PageHeader } from "@/components/layout/PageHeader";
import { CustomerDetailView } from "@/components/customers/CustomerDetailView";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;

  return (
    <>
      <PageHeader
        title="Customer"
        description="Outcomes, support, deployment health, the shared plan and private feedback."
      />
      <CustomerDetailView clientId={clientId} />
    </>
  );
}
