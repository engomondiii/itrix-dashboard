import "server-only";

import { AGENT_AUTO_APPROVE_MAX_LEVEL } from "@/constants/claimLevels";
import type {
  ConversationSummary,
  ConversationThread,
  Message,
  SendMessageResult,
} from "@/types/conversation";

/**
 * Mock console store. Conversations across the three client contexts, with a
 * governed team→client send: a team message above the auto-approve threshold is
 * held "under_review" (never delivered) instead of posting.
 */

interface StoredConversation extends ConversationThread {
  lastMessageAt: string;
  unreadCount: number;
}

function seed(): StoredConversation[] {
  return [
    {
      id: "conv-1",
      context: "review",
      title: "Cloud AI compute cost",
      leadId: "l001",
      lastMessageAt: "2026-07-07T09:12:00Z",
      unreadCount: 1,
      messages: [
        {
          id: "m1",
          senderKind: "client",
          agentKey: null,
          body: "Our inference bill is growing faster than usage. Where does the waste come from?",
          citedChunkIds: [],
          governanceStatus: "auto_approved",
          underReview: false,
          at: "2026-07-07T09:10:00Z",
        },
        {
          id: "m2",
          senderKind: "agent",
          agentKey: "diagnosis",
          body: "Rising spend usually traces to redundant computation entering at the representation layer, before kernels run. A short review can map where.",
          citedChunkIds: ["problem_cost_002"],
          governanceStatus: "auto_approved",
          underReview: false,
          at: "2026-07-07T09:12:00Z",
        },
      ],
    },
    {
      id: "conv-2",
      context: "portal",
      title: "Semiconductor SDK partner",
      leadId: "l002",
      lastMessageAt: "2026-07-06T15:40:00Z",
      unreadCount: 0,
      messages: [
        {
          id: "m3",
          senderKind: "client",
          agentKey: null,
          body: "Can you share the benchmark harness so our team can reproduce it?",
          citedChunkIds: [],
          governanceStatus: "auto_approved",
          underReview: false,
          at: "2026-07-06T15:30:00Z",
        },
        {
          id: "m4",
          senderKind: "team",
          agentKey: null,
          body: "We can share the harness under NDA — I’ll prepare the paperwork and follow up.",
          citedChunkIds: [],
          governanceStatus: "approved",
          underReview: false,
          at: "2026-07-06T15:40:00Z",
        },
      ],
    },
  ];
}

const conversations: StoredConversation[] = seed();

function toSummary(c: StoredConversation): ConversationSummary {
  const lastDeliverable = [...c.messages].reverse().find((m) => !m.underReview);
  return {
    id: c.id,
    context: c.context,
    title: c.title,
    leadId: c.leadId ?? null,
    lastMessageAt: c.lastMessageAt,
    unreadCount: c.unreadCount,
    lastPreview: (lastDeliverable?.body ?? "").slice(0, 120),
  };
}

export function listConversations(): ConversationSummary[] {
  return [...conversations]
    .sort((a, b) => (a.lastMessageAt < b.lastMessageAt ? 1 : -1))
    .map(toSummary);
}

export function getThread(id: string): ConversationThread | null {
  const c = conversations.find((x) => x.id === id);
  if (!c) return null;
  return {
    id: c.id,
    context: c.context,
    title: c.title,
    leadId: c.leadId ?? null,
    messages: c.messages,
  };
}

/** The lead a conversation belongs to (used to link a held draft back to context). */
export function leadIdForConversation(id: string): string | null {
  return conversations.find((x) => x.id === id)?.leadId ?? null;
}

export interface PostTeamMessageResult extends SendMessageResult {
  /** True when the message was held for approval instead of delivered. */
  held: boolean;
}

export function postTeamMessage(
  id: string,
  body: string,
  claimLevel: number,
): PostTeamMessageResult | null {
  const c = conversations.find((x) => x.id === id);
  if (!c) return null;

  const held = claimLevel > AGENT_AUTO_APPROVE_MAX_LEVEL;
  const message: Message = {
    id: `m${Date.now()}`,
    senderKind: "team",
    agentKey: null,
    // Held drafts never leak their body to a client-safe view.
    body: held ? "" : body,
    citedChunkIds: [],
    governanceStatus: held ? "under_review" : "approved",
    underReview: held,
    at: new Date().toISOString(),
  };
  c.messages = [...c.messages, message];
  if (!held) c.lastMessageAt = message.at;

  return { messageId: message.id, governanceStatus: message.governanceStatus, held };
}

/**
 * Deliver a governed draft into its thread once it clears approval. Replaces the
 * pending "under review" placeholder if one exists, otherwise appends.
 */
export function deliverApprovedMessage(
  conversationId: string,
  body: string,
  agentKey: string | null,
  citedChunkIds: string[] = [],
): void {
  const c = conversations.find((x) => x.id === conversationId);
  if (!c) return;

  const at = new Date().toISOString();
  const held = [...c.messages].reverse().find((m) => m.underReview);
  if (held) {
    c.messages = c.messages.map((m) =>
      m.id === held.id
        ? { ...m, body, citedChunkIds, governanceStatus: "approved", underReview: false, at }
        : m,
    );
  } else {
    c.messages = [
      ...c.messages,
      {
        id: `m${Date.now()}`,
        senderKind: agentKey ? "agent" : "team",
        agentKey,
        body,
        citedChunkIds,
        governanceStatus: "approved",
        underReview: false,
        at,
      },
    ];
  }
  c.lastMessageAt = at;
}
