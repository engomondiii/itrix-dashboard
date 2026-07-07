import { PageHeader } from "@/components/layout/PageHeader";
import { AuditTrailTable } from "@/components/governance/AuditTrailTable";

export default function GovernanceAuditPage() {
  return (
    <>
      <PageHeader
        title="Governance audit"
        description="Every approval, edit, and rejection of an agent or team draft."
      />
      <AuditTrailTable />
    </>
  );
}
