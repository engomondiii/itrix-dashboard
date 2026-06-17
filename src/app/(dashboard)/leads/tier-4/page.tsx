import { LeadsView } from "@/components/leads/LeadsView";

export default function Tier4LeadsPage() {
  return (
    <LeadsView
      lockedTier={4}
      title="Tier 4 · Low Fit"
      description="Score 0–39 · educational content only."
    />
  );
}
