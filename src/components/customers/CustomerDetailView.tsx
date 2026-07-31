"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QueryState } from "@/components/ui/query-state";
import { NextBestAction } from "@/components/cockpit/NextBestAction";
import { useCustomerDetail } from "@/hooks/useCustomers";
import { formatDate } from "@/lib/formatting";

import { AccountOriginBadge } from "./AccountOriginBadge";
import { ChangeDigestPreview } from "./ChangeDigestPreview";
import { CustomerHealthBadge } from "./CustomerHealthBadge";
import { VerificationBadge } from "./VerificationBadge";
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
                {(detail.customer.journeyNumber != null || detail.customer.stateLabel) && (
                  <Badge variant="neutral">
                    {[detail.customer.journeyNumber, detail.customer.stateLabel]
                      .filter((v) => v != null)
                      .join(" · ")}
                  </Badge>
                )}
                {detail.customer.adoptionPercent != null && (
                  <Badge variant="neutral">
                    {detail.customer.adoptionPercent}% adoption
                  </Badge>
                )}
                {detail.customer.expansionAllowed === false && (
                  <Badge variant="warning">expansion suppressed</Badge>
                )}
                <AccountOriginBadge origin={detail.customer.accountOrigin} />
                <VerificationBadge
                  verified={detail.customer.emailVerified}
                  verifiedAt={detail.customer.emailVerifiedAt}
                />
              </div>
              {detail.customer.reasons.length > 0 && (
                <p className="text-caption text-ink-secondary">
                  {detail.customer.reasons.join(" · ")}
                </p>
              )}
              {detail.customer.firstPaymentAt && (
                <p className="text-caption text-ink-secondary">
                  Customer since first payment on {formatDate(detail.customer.firstPaymentAt)}
                  {detail.customer.nextReviewDate && (
                    <> · next success review {formatDate(detail.customer.nextReviewDate)}</>
                  )}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Each panel renders only when the wire actually served its data.
              The shipped v7.1 detail is a flat health summary — an absent
              panel means "not served yet", and rendering an empty list
              instead would claim "none exist", which is a different fact. */}
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <div className="space-y-4">
              {detail.outcomes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Outcomes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OutcomeStatusTable outcomes={detail.outcomes} />
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <CustomerSupportPanel clientId={clientId} />
                </CardContent>
              </Card>

              {detail.deployments && (
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
              )}

              {detail.plan && (
                <Card>
                  <CardHeader>
                    <CardTitle>Shared plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SuccessPlanPanel plan={detail.plan} />
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-4">
              {/* The rule, rendered honestly — including when it says
                  "do not sell right now". */}
              <NextBestAction clientId={clientId} />

              {detail.team && (
                <Card>
                  <CardHeader>
                    <CardTitle>Relationship team</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RelationshipTeamPanel team={detail.team} />
                  </CardContent>
                </Card>
              )}

              {detail.feedback && (
                <Card>
                  <CardHeader>
                    <CardTitle>Private feedback</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FeedbackRiskAlert feedback={detail.feedback} />
                  </CardContent>
                </Card>
              )}

              {detail.changes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Changes since their last visit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChangeDigestPreview changes={detail.changes} />
                  </CardContent>
                </Card>
              )}

              {!detail.outcomes && !detail.deployments && !detail.plan && (
                <p className="text-caption text-ink-secondary">
                  Outcomes, deployments, the shared plan, team, feedback and the
                  change digest are not served by this backend yet — the health
                  summary above is what the wire carries today.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
