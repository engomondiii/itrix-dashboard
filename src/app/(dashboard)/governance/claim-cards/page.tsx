import { PageHeader } from "@/components/layout/PageHeader";
import { ClaimCardTable } from "@/components/governance/ClaimCardTable";

export default function ClaimCardsPage() {
  return (
    <>
      <PageHeader
        title="Claim-Cards"
        description="The approved wordings every agent and console message is checked against. Editing is Admin / Assessment Team only."
      />
      <ClaimCardTable />
    </>
  );
}
