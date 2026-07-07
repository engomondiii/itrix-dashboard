"use client";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { useConversation } from "@/hooks/useConsole";
import { siteConfig } from "@/config/site.config";
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
        <h2 className="text-section font-semibold text-ink-900">{data.title}</h2>
        <Badge variant="neutral">{CONVERSATION_CONTEXT_LABEL[data.context]}</Badge>
        <span className="ml-auto text-micro text-ink-400">
          {siteConfig.flags.realtime ? "Live" : "Polling"}
        </span>
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
