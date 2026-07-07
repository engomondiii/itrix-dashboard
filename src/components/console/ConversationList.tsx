"use client";

import { MessagesSquareIcon } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { useConversations } from "@/hooks/useConsole";

import { ConversationListItem } from "./ConversationListItem";

export function ConversationList() {
  const { data, isLoading, isError } = useConversations();

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="size-5" />
      </div>
    );
  }
  if (isError) {
    return (
      <EmptyState
        title="Couldn’t load conversations"
        description="The console endpoint isn’t available yet."
      />
    );
  }
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={MessagesSquareIcon}
        title="No conversations"
        description="Client conversations across review, client page, and portal appear here."
      />
    );
  }

  return (
    <div className="space-y-2">
      {data.map((c) => (
        <ConversationListItem key={c.id} conversation={c} />
      ))}
    </div>
  );
}
