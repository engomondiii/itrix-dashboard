import { Badge } from "@/components/ui/badge";
import { AGENT_DISPLAY_LABEL, TEAM_DISPLAY_LABEL } from "@/constants/agentKeys";
import type { SenderKind } from "@/types/conversation";

const CONFIG: Record<SenderKind, { label: string; variant: "neutral" | "info" | "gold" }> = {
  client: { label: "Client", variant: "neutral" },
  agent: { label: AGENT_DISPLAY_LABEL, variant: "info" },
  team: { label: TEAM_DISPLAY_LABEL, variant: "gold" },
};

export function SenderKindBadge({ kind }: { kind: SenderKind }) {
  const c = CONFIG[kind];
  return <Badge variant={c.variant}>{c.label}</Badge>;
}
