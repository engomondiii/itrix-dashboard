'use client';

import { http } from '@/lib/api/client';
import type {
  ConversationSummary,
  ConversationThread,
  SendMessageResult,
  ThreadDetail,
} from './types';

const V1 = '/api/v1';

export function getThread(threadId: string): Promise<ThreadDetail> {
  return http.get<ThreadDetail>(`${V1}/cockpit/threads/${threadId}/`);
}

/** Bare array, newest first, max 200, no filters. */
export function listConversations(): Promise<ConversationSummary[]> {
  return http.get<ConversationSummary[]>(`${V1}/console/conversations/`);
}

/** There is no /console/.../messages/ — the conversation detail carries them. */
export function getConversation(conversationId: string): Promise<ConversationThread> {
  return http.get<ConversationThread>(`${V1}/conversations/${conversationId}/`);
}

/**
 * Post a human message. claimLevel ≥ 3 is HELD for approval (the threshold is
 * server-tunable) — always read `governanceStatus` off the response.
 */
export function sendConsoleMessage(
  conversationId: string,
  body: string,
  claimLevel = 1,
): Promise<SendMessageResult> {
  return http.post<SendMessageResult>(
    `${V1}/console/conversations/${conversationId}/message/`,
    { body, claimLevel },
  );
}
