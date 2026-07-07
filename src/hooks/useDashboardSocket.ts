"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { siteConfig } from "@/config/site.config";
import { WsClient } from "@/lib/realtime/wsClient";
import { SOCKET_EVENTS } from "@/lib/realtime/socketEvents";

/**
 * App-wide console socket. When realtime is off (default) this is a no-op and the
 * app relies on polling. When on, it invalidates the relevant query caches as
 * events arrive so the console, approvals, and journey views update live.
 */
export function useDashboardSocket() {
  const qc = useQueryClient();

  useEffect(() => {
    if (!siteConfig.flags.realtime) return;

    const client = new WsClient(`${siteConfig.wsUrl}/console/`, (event) => {
      switch (event.type) {
        case SOCKET_EVENTS.messageFinal:
        case SOCKET_EVENTS.messageUnderReview:
        case SOCKET_EVENTS.teamTyping:
        case SOCKET_EVENTS.presenceUpdate:
          qc.invalidateQueries({ queryKey: ["conversations"] });
          qc.invalidateQueries({ queryKey: ["conversation"] });
          break;
        case SOCKET_EVENTS.approvalNew:
          qc.invalidateQueries({ queryKey: ["approvals"] });
          break;
        case SOCKET_EVENTS.journeyReveal:
          qc.invalidateQueries({ queryKey: ["journey"] });
          break;
        default:
          break;
      }
    });

    client.connect();
    return () => client.close();
  }, [qc]);
}
