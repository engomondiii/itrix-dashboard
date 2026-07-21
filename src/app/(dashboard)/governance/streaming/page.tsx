import { PageHeader } from "@/components/layout/PageHeader";
import { BlockingApprovalBanner } from "@/components/governance/BlockingApprovalBanner";
import { StreamGuardHitTable } from "@/components/governance/StreamGuardHitTable";

export default function GovernanceStreamingPage() {
  return (
    <>
      <PageHeader
        title="Streaming governance"
        description="Every stream-guard halt and envelope downgrade, with the matched pattern. A rising hit rate is retrieval or prompt drift, not noise."
      />
      <div className="space-y-4">
        <BlockingApprovalBanner />
        <StreamGuardHitTable />
      </div>
    </>
  );
}