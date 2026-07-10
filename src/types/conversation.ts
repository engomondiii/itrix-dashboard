export const CONVERSATION_CONTEXTS = ["review", "client_page", "portal"] as const;
export type ConversationContext = (typeof CONVERSATION_CONTEXTS)[number];

export const CONVERSATION_CONTEXT_LABEL: Record<ConversationContext, string> = {
  review: "Review",
  client_page: "Client page",
  portal: "Portal",
};

/**
 * Mirrors the backend `SenderKind`. `visitor` is an anonymous review-surface
 * participant (before they become a client) and `system` is a machine notice —
 * both appear in real console threads, so neither may be omitted.
 */
export const SENDER_KINDS = ["visitor", "client", "agent", "team", "system"] as const;
export type SenderKind = (typeof SENDER_KINDS)[number];

/** A conversation row in the console list (backend `ConversationSummarySerializer`). */
export interface ConversationSummary {
  id: string;
  context: ConversationContext;
  title: string;
  /** The lead this thread belongs to, when known — enables the back-link to context. */
  leadId?: string | null;
  lastMessageAt: string;
  unreadCount: number;
  lastPreview: string;
}

/** A single message (backend client-safe `MessageSerializer`). */
export interface Message {
  id: string;
  senderKind: SenderKind;
  agentKey: string | null;
  body: string;
  citedChunkIds: string[];
  governanceStatus: string;
  underReview: boolean;
  at: string;
}

/** A full conversation thread (backend `ConversationThreadSerializer`). */
export interface ConversationThread {
  id: string;
  context: ConversationContext;
  title: string;
  /** The lead this thread belongs to, when known. */
  leadId?: string | null;
  messages: Message[];
}

/** Result of a governed team→client send. */
export interface SendMessageResult {
  messageId: string;
  governanceStatus: string;
}
