import { LeadsView } from "@/components/leads/LeadsView";

export default function Tier2LeadsPage() {
  return (
    <LeadsView
      lockedTier={2}
      title="Tier 2 · Qualified"
      description="Score 60–79 · paid evaluation or meeting, 48-hour response SLA."
    />
  );
}
