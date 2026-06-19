"use client";

import { use } from "react";
import Link from "next/link";
import { SearchXIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { CopyButton } from "@/components/ui/copy-button";
import { LeadDetailHeader } from "@/components/lead-detail/LeadDetailHeader";
import { LeadQualificationAnswers } from "@/components/lead-detail/LeadQualificationAnswers";
import { LeadTimeline } from "@/components/lead-detail/LeadTimeline";
import { LeadNotes } from "@/components/lead-detail/LeadNotes";
import { LeadScoreBreakdown } from "@/components/lead-detail/LeadScoreBreakdown";
import { LeadStatusControl } from "@/components/lead-detail/LeadStatusControl";
import { LeadOwnerControl } from "@/components/lead-detail/LeadOwnerControl";
import { LeadActions } from "@/components/lead-detail/LeadActions";
import { LeadMeetings } from "@/components/lead-detail/LeadMeetings";
import { FollowUpEmailDraft } from "@/components/lead-detail/FollowUpEmailDraft";
import { LeadProductRouteBadge } from "@/components/leads/LeadProductRouteBadge";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";
import { useLeadDetail } from "@/hooks/useLeadDetail";

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = use(params);
  const { data: lead, isLoading, isError } = useLeadDetail(leadId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="size-5" />
      </div>
    );
  }

  if (isError || !lead) {
    return (
      <EmptyState
        icon={SearchXIcon}
        title="Lead not found"
        description="This lead may have been removed or the link is invalid."
        action={
          <Link href={ROUTES.leads} className="text-sec font-medium text-sapphire-600">
            Back to all leads
          </Link>
        }
      />
    );
  }

  const handoffMemo = `LEAD HANDOFF — ${lead.company ?? lead.visitorName ?? lead.email}
Tier ${lead.tier} · Score ${lead.score} · ${lead.productRoute} · ${lead.commercialPath}
Bottleneck: ${lead.computeBottleneck || "—"}
Primary pain: ${lead.primaryPain || "—"} | Workload: ${lead.workloadType || "—"}
Stack: ${(lead.currentStack ?? []).join(", ") || "—"}
Recommended next step: ${lead.recommendedNextStep || "—"}`;

  return (
    <>
      <LeadDetailHeader lead={lead} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>AI summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-body text-ink-800">
                {lead.computeBottleneck || "No AI summary yet for this lead."}
              </p>
              {lead.recommendedNextStep && (
                <div className="rounded-md bg-sapphire-50 p-3 text-sec text-sapphire-700">
                  Recommended next step: {lead.recommendedNextStep}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Qualification</CardTitle>
            </CardHeader>
            <CardContent>
              {lead.qualification && (
                <LeadQualificationAnswers answers={lead.qualification} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadTimeline activity={lead.activity ?? []} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Internal notes</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadNotes leadId={lead.id} notes={lead.notes ?? []} />
            </CardContent>
          </Card>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadActions lead={lead} />
            </CardContent>
          </Card>

          {lead.meetings && lead.meetings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Meetings</CardTitle>
              </CardHeader>
              <CardContent>
                <LeadMeetings meetings={lead.meetings} />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Ownership</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <div className="text-micro font-semibold uppercase tracking-[0.06em] text-ink-400">
                  Status
                </div>
                <LeadStatusControl leadId={lead.id} status={lead.status} />
              </div>
              <div className="space-y-1">
                <div className="text-micro font-semibold uppercase tracking-[0.06em] text-ink-400">
                  Owner
                </div>
                <LeadOwnerControl leadId={lead.id} owner={lead.owner} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Route & score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <LeadProductRouteBadge route={lead.productRoute} />
                <Badge variant="neutral">{lead.commercialPath}</Badge>
              </div>
              <LeadScoreBreakdown breakdown={lead.scoreBreakdown} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Follow-up email</CardTitle>
            </CardHeader>
            <CardContent>
              <FollowUpEmailDraft lead={lead} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Offline handoff memo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <pre className="max-h-48 overflow-y-auto rounded-md bg-surface-sunken p-3 font-sans text-caption whitespace-pre-wrap text-ink-700">
                {handoffMemo}
              </pre>
              <div className="flex justify-end">
                <CopyButton value={handoffMemo} label="Copy memo" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
