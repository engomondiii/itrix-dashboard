import type { SocketEvent } from "./socketEvents";

type Handler = (event: SocketEvent) => void;

/**
 * Minimal WebSocket client with exponential-backoff reconnect (Surface 2 v3.0).
 * Inert until `NEXT_PUBLIC_ENABLE_REALTIME` is on. NOTE: team-JWT auth is httpOnly,
 * so a browser can't attach it as a subprotocol directly — wiring the token to the
 * WS handshake is // v3: pending (a same-origin upgrade proxy). Until then this
 * connects unauthenticated and the app falls back to polling.
 */
export class WsClient {
  private ws: WebSocket | null = null;
  private readonly url: string;
  private readonly handler: Handler;
  private closedByUser = false;
  private backoffMs = 1000;

  constructor(url: string, handler: Handler) {
    this.url = url;
    this.handler = handler;
  }

  connect(): void {
    this.closedByUser = false;
    try {
      this.ws = new WebSocket(this.url);
    } catch {
      this.scheduleReconnect();
      return;
    }
    this.ws.onopen = () => {
      this.backoffMs = 1000;
    };
    this.ws.onmessage = (ev) => {
      try {
        this.handler(JSON.parse(ev.data) as SocketEvent);
      } catch {
        /* ignore malformed frames */
      }
    };
    this.ws.onclose = () => {
      if (!this.closedByUser) this.scheduleReconnect();
    };
    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  private scheduleReconnect(): void {
    const delay = this.backoffMs;
    this.backoffMs = Math.min(this.backoffMs * 2, 30_000);
    setTimeout(() => {
      if (!this.closedByUser) this.connect();
    }, delay);
  }

  send(data: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  close(): void {
    this.closedByUser = true;
    this.ws?.close();
    this.ws = null;
  }
}
