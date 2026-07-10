import { Badge } from "@/components/ui/badge";
import { AGENT_DISPLAY_LABEL, TEAM_DISPLAY_LABEL } from "@/constants/agentKeys";
import type { SenderKind } from "@/types/conversation";

const CONFIG: Record<SenderKind, { label: string; variant: "neutral" | "info" | "gold" }> = {
  visitor: { label: "Visitor", variant: "neutral" },
  client: { label: "Client", variant: "neutral" },
  agent: { label: AGENT_DISPLAY_LABEL, variant: "info" },
  team: { label: TEAM_DISPLAY_LABEL, variant: "gold" },
  system: { label: "System", variant: "neutral" },
};

export function SenderKindBadge({ kind }: { kind: SenderKind }) {
  // Defensive: an unrecognised sender kind must not take down the thread.
  const c = CONFIG[kind] ?? { label: kind, variant: "neutral" as const };
  return <Badge variant={c.variant}>{c.label}</Badge>;
}
