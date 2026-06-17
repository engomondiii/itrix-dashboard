import { LeadsView } from "@/components/leads/LeadsView";

export default function Tier1LeadsPage() {
  return (
    <LeadsView
      lockedTier={1}
      title="Tier 1 · Strategic"
      description="Score 80–100 · immediate handoff, 24-hour response SLA."
    />
  );
}
