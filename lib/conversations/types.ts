/**
 * Conversation-surface wire types (itrix-backend).
 *
 * TWO SEPARATE MODELS, two id spaces, no cross-reference field:
 *   - cockpit Threads  (oversight board + transcript; REAL bodies, incl. held)
 *   - console Conversations (the message plane; held bodies come back "" —
 *     only the thread transcript or the approval queue shows held content)
 * The only join is a shared leadId, when both sides have one.
 */

export type SenderKind = 'visitor' | 'client' | 'agent' | 'team' | 'system';
export type GovernanceStatus = 'auto_approved' | 'pending' | 'approved' | 'blocked';
export type StreamingStatus = 'pending' | 'streaming' | 'settled' | 'halted' | 'under_review';

export interface ThreadTurn {
  id: string;
  seq: number;
  senderKind: SenderKind;
  agentKey: string | null;
  /** Raw body — held/blocked content IS present here. */
  body: string;
  governanceStatus: GovernanceStatus;
  claimLevel: number;
  streamingStatus: StreamingStatus;
  citedChunkIds: string[];
  at: string;
}

export interface GuardHit {
  id: string;
  kind: string;
  category: string;
  pattern: string;
  agentKey: string;
  plane: string;
  at: string;
  /** Present ONLY for ADMIN/ASSESSMENT viewers; absent otherwise. */
  matchedText?: string;
  matchedTextNotice?: string;
}

export interface ThreadDetail {
  threadId: string;
  title: string;
  anonymous: boolean;
  leadId: string | null;
  company: string;
  journeyState: string;
  ownerKind: string;
  createdAt: string;
  lastActivityAt: string | null;
  turns: ThreadTurn[];
  guardHits: GuardHit[];
  /** Hardcoded null/[] by the backend — never populated here. */
  coverage: null;
  attachments: [];
}

export type ConversationContext =
  | 'review'
  | 'anonymous_review'
  | 'client_page'
  | 'portal'
  | 'customer_success'
  | 'console';

/** GET /console/conversations/ — BARE ARRAY, newest activity first, max 200. */
export interface ConversationSummary {
  id: string;
  context: ConversationContext;
  title: string;
  lastMessageAt: string | null;
  unreadCount: number;
  lastPreview: string;
  leadId: string | null;
}

export interface ConsoleMessage {
  id: string;
  senderKind: SenderKind;
  agentKey: string | null;
  /** "" when held/blocked — render a placeholder off underReview. */
  body: string;
  citedChunkIds: string[];
  governanceStatus: GovernanceStatus;
  underReview: boolean;
  at: string;
}

/** GET /conversations/{id}/ */
export interface ConversationThread {
  id: string;
  context: ConversationContext;
  title: string;
  messages: ConsoleMessage[];
  leadId: string | null;
}

/** POST console message response — read governanceStatus, don't predict it. */
export interface SendMessageResult {
  messageId: string;
  governanceStatus: 'auto_approved' | 'pending' | 'blocked';
}
