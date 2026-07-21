"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useSendTeamMessage } from "@/hooks/useConsole";
import { CLAIM_LEVELS, CLAIM_LEVEL_LABEL } from "@/constants/claimLevels";

/** Governed team→client composer. Level 3+ is held for approval before delivery. */
export function AgentTeamComposer({ conversationId }: { conversationId: string }) {
  const send = useSendTeamMessage(conversationId);
  const [body, setBody] = useState("");
  const [claimLevel, setClaimLevel] = useState(1);

  function submit() {
    if (!body.trim()) return;
    send.mutate({ body, claimLevel }, { onSuccess: () => setBody("") });
  }

  return (
    <div className="space-y-2 rounded-md border border-border-soft bg-surface p-3">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder="Reply as the itriX team…"
        className="w-full resize-y rounded-md border border-border-soft bg-surface p-2 text-sec text-ink-primary outline-none focus:border-structure-600"
      />
      <div className="flex items-center gap-2">
        <label htmlFor="claim-level" className="text-micro text-ink-secondary">
          Claim level
        </label>
        <select
          id="claim-level"
          value={claimLevel}
          onChange={(e) => setClaimLevel(Number(e.target.value))}
          className="rounded-md border border-border-soft bg-surface px-2 py-1 text-sec text-ink-primary"
        >
          {CLAIM_LEVELS.map((l) => (
            <option key={l} value={l}>
              L{l} · {CLAIM_LEVEL_LABEL[l]}
            </option>
          ))}
        </select>
        <Button
          size="sm"
          className="ml-auto"
          disabled={send.isPending || !body.trim()}
          onClick={submit}
        >
          Send (governed)
        </Button>
      </div>
      <p className="text-micro text-ink-secondary">
        Every team message passes the same governance pass as the agents. Level 3+ is held
        for approval.
      </p>
    </div>
  );
}
