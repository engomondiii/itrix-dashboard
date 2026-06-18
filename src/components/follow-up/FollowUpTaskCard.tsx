import Link from "next/link";

import { LeadTierBadge } from "@/components/leads/LeadTierBadge";
import { LeadOwnerAvatar } from "@/components/leads/LeadOwnerAvatar";
import { FollowUpSLATimer } from "@/components/follow-up/FollowUpSLATimer";
import { FollowUpCompleteButton } from "@/components/follow-up/FollowUpCompleteButton";
import { FollowUpSnoozeButton } from "@/components/follow-up/FollowUpSnoozeButton";
import { FollowUpRescheduleMenu } from "@/components/follow-up/FollowUpRescheduleMenu";
import { FollowUpDismissButton } from "@/components/follow-up/FollowUpDismissButton";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";
import type { FollowUpTask } from "@/types/followUp";

export function FollowUpTaskCard({ task }: { task: FollowUpTask }) {
  return (
    <div className="rounded-md border border-line bg-surface p-3 shadow-1">
      <div className="flex flex-wrap items-center gap-3">
        <LeadTierBadge tier={task.tier} />
        <Link
          href={ROUTES.lead(task.leadId)}
          className="text-sec font-medium text-ink-900 hover:text-sapphire-600"
        >
          {task.leadName}
        </Link>
        {task.status === "snoozed" && <Badge variant="neutral">Snoozed</Badge>}
        <div className="ml-auto flex items-center gap-4">
          <FollowUpSLATimer dueAt={task.dueAt} />
          <LeadOwnerAvatar owner={task.owner} />
          <div className="flex items-center gap-1">
            <FollowUpCompleteButton taskId={task.id} />
            <FollowUpSnoozeButton taskId={task.id} />
            <FollowUpRescheduleMenu taskId={task.id} />
            <FollowUpDismissButton taskId={task.id} />
          </div>
        </div>
      </div>
      {task.note && (
        <p className="mt-2 border-t border-line pt-2 text-caption text-ink-500">
          {task.note}
        </p>
      )}
    </div>
  );
}
