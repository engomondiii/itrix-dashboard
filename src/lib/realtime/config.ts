/**
 * Realtime transport switch.
 *
 * The console, approvals, and journey views use REST **polling** as their
 * production transport — that path is complete and ships on by default.
 *
 * The WebSocket path (`wsClient` / `useDashboardSocket`) is scaffolded but stays
 * OFF until the WS auth handshake is wired: the team-JWT is httpOnly and can't be
 * attached to a browser WebSocket subprotocol directly, so a same-origin upgrade
 * proxy (or short-lived ticket) is needed first. Flip this to `true` once that lands.
 */
export const REALTIME_ENABLED = false;
