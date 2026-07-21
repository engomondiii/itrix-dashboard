"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { useConversation } from "@/hooks/useConsole";
import { REALTIME_ENABLED } from "@/lib/realtime/config";
import { CONVERSATION_CONTEXT_LABEL } from "@/types/conversation";

import { AgentTeamComposer } from "./AgentTeamComposer";
import { MessageRow } from "./MessageRow";

export function LiveThread({ conversationId }: { conversationId: string }) {
  const { data, isLoading, isError } = useConversation(conversationId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="size-5" />
      </div>
    );
  }
  if (isError || !data) {
    return (
      <EmptyState
        title="Conversation not found"
        description="It may have been closed, or the id is invalid."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-section font-semibold text-ink-primary">{data.title}</h2>
        <Badge variant="neutral">{CONVERSATION_CONTEXT_LABEL[data.context]}</Badge>
        <div className="ml-auto flex items-center gap-3">
          {data.leadId && (
            <Link
              href={ROUTES.lead(data.leadId)}
              className="text-micro text-ink-primary hover:underline"
            >
              View lead
            </Link>
          )}
          <span className="text-micro text-ink-secondary">
            {REALTIME_ENABLED ? "Live" : "Polling"}
          </span>
        </div>
      </div>
      <div className="space-y-2">
        {data.messages.map((m) => (
          <MessageRow key={m.id} message={m} />
        ))}
      </div>
      <AgentTeamComposer conversationId={conversationId} />
    </div>
  );
}
