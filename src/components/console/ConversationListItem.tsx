import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";
import { CONVERSATION_CONTEXT_LABEL, type ConversationSummary } from "@/types/conversation";

import { conversationPreview } from "./conversationPreview";

export function ConversationListItem({
  conversation,
}: {
  conversation: ConversationSummary;
}) {
  const preview = conversationPreview(conversation);

  return (
    <Link
      href={ROUTES.consoleThread(conversation.id)}
      className="block rounded-md border border-border-soft bg-surface p-3 transition-colors hover:border-tint"
    >
      <div className="flex items-center gap-2">
        <span className="text-sec font-medium text-ink-primary">{conversation.title}</span>
        <Badge variant="neutral">
          {CONVERSATION_CONTEXT_LABEL[conversation.context]}
        </Badge>
        {preview.kind === "pending" && <Badge variant="warning">Awaiting approval</Badge>}
        {/*
          NOT labelled "new". On the team plane the backend resolves this with no
          client and no user, so it counts approved messages rather than ones this
          operator has not read — there is no per-operator read state on this
          plane yet. Showing the number is useful; calling it "new" is a claim the
          data does not support.
        */}
        {conversation.unreadCount > 0 && (
          <Badge variant="info">{conversation.unreadCount} approved</Badge>
        )}
      </div>
      <p className="mt-1 line-clamp-1 text-caption text-ink-secondary">
        {preview.kind === "text" && preview.text}
        {preview.kind === "pending" && (
          <span className="text-warning-text">
            Latest turn is not approved yet — nothing has been delivered.
          </span>
        )}
        {preview.kind === "empty" && <span className="text-ink-muted">No messages yet</span>}
      </p>
    </Link>
  );
}
