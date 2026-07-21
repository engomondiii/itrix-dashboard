"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QueryState } from "@/components/ui/query-state";
import { useCustomerNextAction } from "@/hooks/useCustomerNextAction";
import { features } from "@/config/features.config";
import { NBA_ACTION_TYPE_LABEL } from "@/types/nba";

import { CommercialOverrideDialog } from "./CommercialOverrideDialog";
import { SuppressionReasonBadge } from "./SuppressionReasonBadge";

/**
 * The customer-first next-best-action, rendered honestly.
 *
 * This surface does not rank. The backend ran the precedence rule before
 * scoring, and what arrives here is already ordered; re-sorting locally would
 * be how "no commercial action while a support issue is open" quietly stops
 * being true.
 *
 * SUPPRESSED CANDIDATES ARE SHOWN, NOT HIDDEN. An operator who only ever sees
 * one action never learns that a commercial option existed and was ruled out —
 * and would reasonably conclude the tool has nothing to say about expansion.
 * Showing the demoted candidate with its reason is what makes the rule legible
 * rather than mysterious.
 */
export function NextBestAction({ clientId }: { clientId: string }) {
  const query = useCustomerNextAction(clientId);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const nba = query.data;

  if (!features.customerFirstNba) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Next best action</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <QueryState
          isLoading={query.isLoading}
          isError={query.isError}
          hasData={Boolean(nba)}
          label="the next best action"
        error={query.error}
      />

        {nba && (
          <>
            <div className="rounded-md bg-soft p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="neutral">{NBA_ACTION_TYPE_LABEL[nba.primary.type]}</Badge>
                {nba.primary.commercial && <Badge variant="signature">Commercial</Badge>}
              </div>
              <p className="mt-1 text-sec font-medium text-ink-primary">
                {nba.primary.label}
              </p>
              <p className="text-caption text-ink-secondary">{nba.primary.rationale}</p>
            </div>

            {nba.suppressionReason && (
              <div className="space-y-2">
                <SuppressionReasonBadge reason={nba.suppressionReason} />

                {nba.candidates
                  .filter((c) => c.suppressedBy !== null)
                  .map((c) => (
                    <div
                      key={c.id}
                      className="rounded-md border border-dashed border-border-soft p-2.5 opacity-70"
                    >
                      <span className="flex flex-wrap items-center gap-2">
                        <Badge variant="neutral">{NBA_ACTION_TYPE_LABEL[c.type]}</Badge>
                        <span className="text-sec text-ink-secondary line-through">
                          {c.label}
                        </span>
                      </span>
                    </div>
                  ))}

                <Button size="sm" variant="outline" onClick={() => setOverrideOpen(true)}>
                  Act commercially by exception…
                </Button>

                <CommercialOverrideDialog
                  clientId={clientId}
                  reason={nba.suppressionReason}
                  open={overrideOpen}
                  onOpenChange={setOverrideOpen}
                />
              </div>
            )}

            {!nba.suppressionReason && (
              <p className="text-caption text-ink-secondary">
                No customer-first condition is holding. Commercial actions are eligible.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
