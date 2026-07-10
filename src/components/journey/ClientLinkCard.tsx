"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useJourney } from "@/hooks/useJourney";
import type { Lead } from "@/types/lead";

/**
 * The lead's 1:1 portal Client link. A Lead is promoted to a Client only once
 * the invite gate fires and the invite is accepted (journey CLIENT / ENGAGED).
 */
export function ClientLinkCard({ lead }: { lead: Lead }) {
  const { data: journey } = useJourney(lead.id);
  const state = journey?.state ?? lead.journeyState;
  // The journey reaching CLIENT/ENGAGED means an account *should* exist; only a
  // real `client` record proves it does. Don't claim "Linked" without one.
  const expectsAccount = state === "CLIENT" || state === "ENGAGED";
  const linked = lead.client != null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {linked ? (
          <>
            <div className="flex items-center gap-2">
              <Badge variant="success">Linked</Badge>
              <span className="text-sec text-ink-600">{lead.client!.status}</span>
            </div>
            <p className="text-caption text-ink-500">
              Promoted to a portal client account (Surface 3) — the client works in the
              portal; the team works this lead.
            </p>
          </>
        ) : expectsAccount ? (
          <>
            <Badge variant="warning">Not linked</Badge>
            <p className="text-caption text-ink-500">
              The journey has reached {state === "ENGAGED" ? "Engaged" : "Client"}, but no
              portal account is linked to this lead yet.
            </p>
          </>
        ) : (
          <p className="text-sec text-ink-500">
            No client account yet — created when the invite is accepted.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
