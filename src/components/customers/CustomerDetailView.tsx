"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QueryState } from "@/components/ui/query-state";
import { NextBestAction } from "@/components/cockpit/NextBestAction";
import { useCustomerDetail } from "@/hooks/useCustomers";
import { formatDate } from "@/lib/formatting";

import { ChangeDigestPreview } from "./ChangeDigestPreview";
import { CustomerHealthBadge } from "./CustomerHealthBadge";
import { DeploymentHealthRow } from "./DeploymentHealthRow";
import { FeedbackRiskAlert } from "./FeedbackRiskAlert";
import { OutcomeStatusTable } from "./OutcomeStatusTable";
import { RelationshipTeamPanel } from "./RelationshipTeamPanel";
import { SuccessPlanPanel } from "./SuccessPlanPanel";
import { CustomerSupportPanel } from "./CustomerSupportPanel";

/**
 * One customer, read end to end.
 *
 * Ordered by the priority rule rather than by convenience: outcomes and support
 * first, commercial nowhere. "Keeping paying customers happy and successful is
 * more important than moving them toward another agreement. This is not an
 * upsell surface." There is deliberately no expansion control on this page —
 * commercial actions live in the cockpit, where the suppression rule governs
 * them.
 */
export function CustomerDetailView({ clientId }: { clientId: string }) {
  const query = useCustomerDetail(clientId);
  const detail = query.data;

  return (
    <div className="space-y-4">
      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        hasData={Boolean(detail)}
        label="this customer"
        error={query.error}
      />

      {detail && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{detail.customer.company}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <CustomerHealthBadge healthClass={detail.customer.healthClass} />
                <Badge variant="neutral">
                  {detail.customer.journeyNumber} · {detail.customer.stateLabel}
                </Badge>
                <Badge variant="neutral">
                  {detail.customer.adoptionPercent}% adoption
                </Badge>
              </div>
              <p className="text-caption text-ink-secondary">
                Customer since first payment on {formatDate(detail.customer.firstPaymentAt)}
                {detail.customer.nextReviewAt && (
                  <> · next success review {formatDate(detail.customer.nextReviewAt)}</>
                )}
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Outcomes</CardTitle>
                </CardHeader>
                <CardContent>
                  <OutcomeStatusTable outcomes={detail.outcomes} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <CustomerSupportPanel clientId={clientId} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Deployment health</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {detail.deployments.map((d) => (
                      <DeploymentHealthRow key={d.id} deployment={d} />
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Shared plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <SuccessPlanPanel plan={detail.plan} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              {/* The rule, rendered honestly — including when it says
                  "do not sell right now". */}
              <NextBestAction clientId={clientId} />

              <Card>
                <CardHeader>
                  <CardTitle>Relationship team</CardTitle>
                </CardHeader>
                <CardContent>
                  <RelationshipTeamPanel team={detail.team} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Private feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <FeedbackRiskAlert feedback={detail.feedback} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Changes since their last visit</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChangeDigestPreview changes={detail.changes} />
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
