"use client";

import {
  CheckCircle2Icon,
  CheckIcon,
  ChevronDownIcon,
  CircleDashedIcon,
  CircleIcon,
  XCircleIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePoCActions } from "@/hooks/useDeals";
import {
  MILESTONE_STATUSES,
  type MilestoneStatus,
  type PoCMilestone,
} from "@/types/poc";

const ICON: Record<MilestoneStatus, { Icon: typeof CircleIcon; cls: string }> = {
  done: { Icon: CheckCircle2Icon, cls: "text-success" },
  in_progress: { Icon: CircleDashedIcon, cls: "text-warning" },
  pending: { Icon: CircleIcon, cls: "text-ink-muted" },
  missed: { Icon: XCircleIcon, cls: "text-error" },
};

const LABELS: Record<MilestoneStatus, string> = {
  pending: "Pending",
  in_progress: "In progress",
  done: "Done",
  missed: "Missed",
};

export function PoCMilestoneTracker({
  pocId,
  milestones,
}: {
  pocId: string;
  milestones: PoCMilestone[];
}) {
  const { setMilestone } = usePoCActions(pocId);

  return (
    <ol className="space-y-1.5">
      {milestones.map((m) => {
        const { Icon, cls } = ICON[m.status];
        return (
          <li key={m.id} className="flex items-center gap-2 text-sec">
            <Icon className={`size-4 shrink-0 ${cls}`} />
            <span
              className={
                m.status === "pending" ? "text-ink-secondary" : "text-ink-primary"
              }
            >
              {m.label}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={`Set status for ${m.label}`}
                className="ml-auto inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-caption text-ink-secondary outline-none hover:bg-muted hover:text-ink-secondary focus-visible:ring-2 focus-visible:ring-ring"
              >
                {LABELS[m.status]}
                <ChevronDownIcon className="size-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {MILESTONE_STATUSES.map((s) => (
                  <DropdownMenuItem
                    key={s}
                    onClick={() =>
                      setMilestone.mutate({ milestoneId: m.id, status: s })
                    }
                  >
                    {LABELS[s]}
                    {s === m.status && <CheckIcon className="ml-auto" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        );
      })}
    </ol>
  );
}
