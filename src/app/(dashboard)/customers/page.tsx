import { PageHeader } from "@/components/layout/PageHeader";
import { CustomerHealthBoard } from "@/components/customers/CustomerHealthBoard";

export default function CustomersPage() {
  return (
    <>
      <PageHeader
        title="Customers"
        description="Every paying customer from the first payment onward — health, outcomes, support load and adoption. Worst health first."
      />
      <CustomerHealthBoard />
    </>
  );
}
