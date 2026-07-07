import { PageHeader } from "@/components/layout/PageHeader";
import { ApprovalQueue } from "@/components/agents/ApprovalQueue";

export default function AgentApprovalsPage() {
  return (
    <>
      <PageHeader
        title="Agent approvals"
        description="Agent and team drafts above the auto-approve threshold. Level 3 needs citation; levels 4–5 need a second approver before delivery."
      />
      <ApprovalQueue />
    </>
  );
}
