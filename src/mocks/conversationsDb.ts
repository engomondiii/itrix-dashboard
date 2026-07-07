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

let conversations: StoredConversation[] = seed();

function toSummary(c: StoredConversation): ConversationSummary {
  const lastDeliverable = [...c.messages].reverse().find((m) => !m.underReview);
  return {
    id: c.id,
    context: c.context,
    title: c.title,
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
  return { id: c.id, context: c.context, title: c.title, messages: c.messages };
}

export function postTeamMessage(
  id: string,
  body: string,
  claimLevel: number,
): SendMessageResult | null {
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

  return { messageId: message.id, governanceStatus: message.governanceStatus };
}
