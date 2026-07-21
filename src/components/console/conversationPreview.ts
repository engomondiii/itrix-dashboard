import type { ConversationSummary } from "@/types/conversation";

/**
 * What a console row should say where the last message would go.
 *
 * `lastPreview` is computed backend-side from `deliverable_messages()` — the
 * CLIENT-facing filter, which admits only auto-approved and approved turns. So
 * an empty preview does NOT mean "nothing has happened in this conversation".
 * It means nothing has been *approved*, and on a governance console those are
 * opposite situations: the second one is a conversation with a turn sitting at
 * the gate, quite possibly with a visitor waiting on it.
 *
 * `lastMessageAt` separates them. A conversation that has never carried a
 * message has no timestamp; one whose only turns are pending has a timestamp
 * and an empty preview.
 *
 * This lives apart from the component because it is the actual rule — the JSX
 * is just how it is drawn — and because a rule worth getting right is worth
 * being able to exercise on its own.
 */
export type ConversationPreview =
  | { kind: "text"; text: string }
  | { kind: "pending" }
  | { kind: "empty" };

export function conversationPreview(
  conversation: Pick<ConversationSummary, "lastPreview" | "lastMessageAt">,
): ConversationPreview {
  if (conversation.lastPreview) {
    return { kind: "text", text: conversation.lastPreview };
  }
  return conversation.lastMessageAt ? { kind: "pending" } : { kind: "empty" };
}
