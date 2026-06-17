import { LeadsView } from "@/components/leads/LeadsView";

export default function Tier3LeadsPage() {
  return (
    <LeadsView
      lockedTier={3}
      title="Tier 3 · Nurture"
      description="Score 40–59 · automated brief and follow-up."
    />
  );
}
