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
  const hasAccount =
    lead.client != null || state === "CLIENT" || state === "ENGAGED";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {hasAccount ? (
          <>
            <div className="flex items-center gap-2">
              <Badge variant="success">Linked</Badge>
              {lead.client && (
                <span className="text-sec text-ink-600">{lead.client.status}</span>
              )}
            </div>
            <p className="text-caption text-ink-500">
              Promoted to a portal client account (Surface 3).
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
