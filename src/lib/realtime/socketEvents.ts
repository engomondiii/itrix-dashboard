/** WebSocket event vocabulary for the team console (Backend v4 §Realtime). */
export const SOCKET_EVENTS = {
  messageDelta: "message.delta",
  messageFinal: "message.final",
  messageUnderReview: "message.under_review",
  journeyReveal: "journey.reveal",
  presenceUpdate: "presence.update",
  teamTyping: "team.typing",
  approvalNew: "approval.new",
} as const;

export type SocketEventType = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

export interface SocketEvent {
  type: string;
  [key: string]: unknown;
}
