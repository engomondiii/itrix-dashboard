"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useRunAgent } from "@/hooks/useCockpit";
import { canAdminGovernance } from "@/constants/permissions";
import { AGENT_LABEL, RUN_AGENT_MENU_KEYS } from "@/constants/agentKeys";
import type { AgentRunResult as AgentRunResultType } from "@/types/agent";

import { AgentRunResult } from "./AgentRunResult";

/** Invoke an agent on demand against this lead. Results still pass governance. */
export function RunAgentMenu({ leadId }: { leadId: string }) {
  const { user } = useAuth();
  const run = useRunAgent(leadId);
  const [last, setLast] = useState<AgentRunResultType | null>(null);

  if (!canAdminGovernance(user?.role)) {
    return (
      <p className="text-caption text-ink-secondary">
        Running agents is restricted to Admin / Assessment Team.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {RUN_AGENT_MENU_KEYS.map((key) => (
          <Button
            key={key}
            size="sm"
            variant="outline"
            disabled={run.isPending}
            onClick={() => run.mutate(key, { onSuccess: (r) => setLast(r) })}
          >
            {AGENT_LABEL[key]}
          </Button>
        ))}
      </div>
      {last && <AgentRunResult result={last} />}
    </div>
  );
}
