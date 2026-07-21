import { Badge } from "@/components/ui/badge";
import { GovernanceStatusPill } from "@/components/agents/GovernanceStatusPill";
import { cn } from "@/lib/utils";
import type { Message, SenderKind } from "@/types/conversation";

import { SenderKindBadge } from "./SenderKindBadge";

function formatAt(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

/** Sender washes - visitor/client neutral, agent tinted, team accent (Theme §21). */
const WASH: Record<SenderKind, string> = {
  visitor: "bg-surface border-border-soft",
  client: "bg-surface border-border-soft",
  agent: "border-tint bg-soft",
  team: "border-tint bg-soft",
  system: "border-border-soft bg-soft",
};

const DELIVERED = new Set(["auto_approved", "approved"]);

export function MessageRow({ message }: { message: Message }) {
  return (
    <div
      className={cn(
        "rounded-md border p-3",
        WASH[message.senderKind] ?? "bg-surface border-border-soft",
      )}
    >
      <div className="mb-1 flex items-center gap-2">
        <SenderKindBadge kind={message.senderKind} />
        {!DELIVERED.has(message.governanceStatus) && (
          <GovernanceStatusPill status={message.governanceStatus} />
        )}
        <span className="ml-auto text-micro text-ink-secondary">{formatAt(message.at)}</span>
      </div>
      {message.underReview ? (
        <p className="text-sec text-warning-text">
          The itriX team is reviewing this before it reaches the client.
        </p>
      ) : (
        <p className="text-sec whitespace-pre-wrap text-ink-primary">{message.body}</p>
      )}
      {message.citedChunkIds.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {message.citedChunkIds.map((c) => (
            <Badge key={c} variant="info" className="font-mono">
              {c}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
