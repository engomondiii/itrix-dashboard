import { apiGet, apiSend } from "@/lib/api/client";
import { API } from "@/constants/routes";
import type {
  ConversationSummary,
  ConversationThread,
  SendMessageResult,
} from "@/types/conversation";

export function listConversations() {
  return apiGet<ConversationSummary[]>(API.consoleConversations);
}

export function getThread(id: string) {
  return apiGet<ConversationThread>(API.consoleMessages(id));
}

export function sendTeamMessage(id: string, body: string, claimLevel = 1) {
  return apiSend<SendMessageResult>(API.consoleMessage(id), "POST", {
    body,
    claimLevel,
  });
}
