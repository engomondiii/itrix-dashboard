"use client";

import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QueryState } from "@/components/ui/query-state";
import { useAuth } from "@/hooks/useAuth";
import { useSupportActions, useSupportRequest } from "@/hooks/useSupport";
import { ROUTES } from "@/constants/routes";
import { formatDateTime } from "@/lib/formatting";
import {
  SUPPORT_STATUS_INTENT,
  SUPPORT_STATUS_LABEL,
  SUPPORT_URGENCY_INTENT,
  SUPPORT_URGENCY_LABEL,
} from "@/types/support";

import { EscalateDialog } from "./EscalateDialog";
import { ResolutionComposer } from "./ResolutionComposer";
import { SupportSlaTimer } from "./SupportSlaTimer";

/** One support request, with the actions an operator can take on it. */
export function SupportRequestDetail({ requestId }: { requestId: string }) {
  const query = useSupportRequest(requestId);
  const { user } = useAuth();
  const { assign } = useSupportActions(requestId);
  const [escalateOpen, setEscalateOpen] = useState(false);

  const request = query.data;
  const resolved = request?.status === "resolved";

  return (
    <div className="space-y-4">
      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        hasData={Boolean(request)}
        label="this support request"
      />

      {request && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{request.subject}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={SUPPORT_URGENCY_INTENT[request.urgency]}>
                  {SUPPORT_URGENCY_LABEL[request.urgency]}
                </Badge>
                <Badge variant={SUPPORT_STATUS_INTENT[request.status]}>
                  {SUPPORT_STATUS_LABEL[request.status]}
                </Badge>
                <SupportSlaTimer dueAt={request.slaDueAt} resolved={resolved} />
                <Link
                  href={ROUTES.customer(request.clientId)}
                  className="text-sec font-medium text-ink-primary hover:underline"
                >
                  {request.company}
                </Link>
              </div>

              <p className="whitespace-pre-wrap text-body text-ink-primary">
                {request.body}
              </p>

              <p className="text-micro text-ink-secondary">
                Raised {formatDateTime(request.createdAt)}
                {request.owner ? ` · owned by ${request.owner}` : " · unassigned"}
                {request.resolvedAt && ` · resolved ${formatDateTime(request.resolvedAt)}`}
              </p>

              {resolved && (
                <p className="text-sec text-ink-secondary">
                  {request.customerConfirmedResolved === true
                    ? "The customer confirmed this resolved it."
                    : "Waiting for the customer to confirm this actually resolved it."}
                </p>
              )}

              {!resolved && (
                <div className="flex flex-wrap gap-2 border-t border-border-soft pt-3">
                  {!request.owner && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={assign.isPending}
                      onClick={() => assign.mutate(user?.name ?? user?.email ?? "Support desk")}
                    >
                      Take it
                    </Button>
                  )}
                  {request.urgency !== "blocking" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setEscalateOpen(true)}
                    >
                      Escalate…
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {!resolved && (
            <Card>
              <CardHeader>
                <CardTitle>Respond</CardTitle>
              </CardHeader>
              <CardContent>
                <ResolutionComposer requestId={request.id} />
              </CardContent>
            </Card>
          )}

          <EscalateDialog
            requestId={request.id}
            open={escalateOpen}
            onOpenChange={setEscalateOpen}
          />
        </>
      )}
    </div>
  );
}
