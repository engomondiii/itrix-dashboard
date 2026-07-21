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
import { JourneyPanel } from "@/components/journey/JourneyPanel";
import { ClientLinkCard } from "@/components/journey/ClientLinkCard";
import { SidebarContractPanel } from "@/components/journey/SidebarContractPanel";
import { CockpitPanel } from "@/components/cockpit/CockpitPanel";
import { PersonaPanel } from "@/components/personas/PersonaPanel";
import { RunAgentMenu } from "@/components/agents/RunAgentMenu";
import { LeadProductRouteBadge } from "@/components/leads/LeadProductRouteBadge";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";
import { leadDisplayName } from "@/lib/formatting";
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
          <Link href={ROUTES.leads} className="text-sec font-medium text-ink-primary">
            Back to all leads
          </Link>
        }
      />
    );
  }

  const handoffMemo = `LEAD HANDOFF — ${leadDisplayName(lead)}
Tier ${lead.tier} · Score ${lead.score} · ${lead.productRoute} · ${lead.commercialPath}
Bottleneck: ${lead.computeBottleneck || "—"}
Primary pain: ${lead.primaryPain || "—"} | Workload: ${lead.workloadType || "—"}
Stack: ${(lead.currentStack ?? []).join(", ") || "—"}
Recommended next step: ${lead.recommendedNextStep || "—"}`;

  return (
    <>
      <LeadDetailHeader lead={lead} />

      {/*
        Two columns, balanced by content weight rather than by card count. The wide,
        dense panels (cockpit, qualification, the email draft) live in the roomy main
        column; the narrow controls and status cards stay in the rail. `items-start`
        stops the shorter column from stretching to match the taller one.
      */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* Main column — wide content */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>AI summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-body text-ink-primary">
                {lead.computeBottleneck || "No AI summary yet for this lead."}
              </p>
              {lead.recommendedNextStep && (
                <div className="rounded-md bg-soft p-3 text-sec text-ink-primary">
                  Recommended next step: {lead.recommendedNextStep}
                </div>
              )}
            </CardContent>
          </Card>

          <CockpitPanel leadId={lead.id} />

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

          {/* Compact status pair — side by side once there's room. */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ownership</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="text-micro font-semibold uppercase tracking-[0.06em] text-ink-secondary">
                    Status
                  </div>
                  <LeadStatusControl leadId={lead.id} status={lead.status} />
                </div>
                <div className="space-y-1">
                  <div className="text-micro font-semibold uppercase tracking-[0.06em] text-ink-secondary">
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
          </div>

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

        {/* Rail — controls and status. Not sticky: it can exceed the viewport height,
            and pinning it would make its lower cards unreachable. */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadActions lead={lead} />
            </CardContent>
          </Card>

          <JourneyPanel leadId={lead.id} />

          {/* The persona hypothesis and the shell contract sit beside the journey
              because all three answer the same question from different angles:
              who we think this is, what they can see, and where they are. */}
          <PersonaPanel leadId={lead.id} />

          <SidebarContractPanel leadId={lead.id} />

          <ClientLinkCard lead={lead} />

          <Card>
            <CardHeader>
              <CardTitle>Run an agent</CardTitle>
            </CardHeader>
            <CardContent>
              <RunAgentMenu leadId={lead.id} />
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
              <CardTitle>Offline handoff memo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <pre className="max-h-48 overflow-y-auto rounded-md bg-soft p-3 font-sans text-caption whitespace-pre-wrap text-ink-secondary">
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
