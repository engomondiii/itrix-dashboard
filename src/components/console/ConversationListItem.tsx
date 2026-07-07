import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";
import { CONVERSATION_CONTEXT_LABEL, type ConversationSummary } from "@/types/conversation";

export function ConversationListItem({
  conversation,
}: {
  conversation: ConversationSummary;
}) {
  return (
    <Link
      href={ROUTES.consoleThread(conversation.id)}
      className="block rounded-md border border-line bg-surface p-3 transition-colors hover:border-sapphire-300"
    >
      <div className="flex items-center gap-2">
        <span className="text-sec font-medium text-ink-900">{conversation.title}</span>
        <Badge variant="neutral">
          {CONVERSATION_CONTEXT_LABEL[conversation.context]}
        </Badge>
        {conversation.unreadCount > 0 && (
          <Badge variant="info">{conversation.unreadCount} new</Badge>
        )}
      </div>
      <p className="mt-1 line-clamp-1 text-caption text-ink-500">
        {conversation.lastPreview || "—"}
      </p>
    </Link>
  );
}
