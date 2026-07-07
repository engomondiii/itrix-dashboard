import { PageHeader } from "@/components/layout/PageHeader";
import { AgentRunLogTable } from "@/components/agents/AgentRunLogTable";

export default function AgentRunsPage() {
  return (
    <>
      <PageHeader
        title="Agent runs"
        description="Audit log of every agent invocation — which agent, claim level, governance verdict, and duration."
      />
      <AgentRunLogTable />
    </>
  );
}
