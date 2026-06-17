import { CheckCircle2Icon, CircleDashedIcon, CircleIcon, XCircleIcon } from "lucide-react";

import type { MilestoneStatus, PoCMilestone } from "@/types/poc";

const ICON: Record<MilestoneStatus, { Icon: typeof CircleIcon; cls: string }> = {
  done: { Icon: CheckCircle2Icon, cls: "text-success" },
  in_progress: { Icon: CircleDashedIcon, cls: "text-warning" },
  pending: { Icon: CircleIcon, cls: "text-ink-300" },
  missed: { Icon: XCircleIcon, cls: "text-error" },
};

export function PoCMilestoneTracker({ milestones }: { milestones: PoCMilestone[] }) {
  return (
    <ol className="space-y-2">
      {milestones.map((m) => {
        const { Icon, cls } = ICON[m.status];
        return (
          <li key={m.id} className="flex items-center gap-2 text-sec">
            <Icon className={`size-4 shrink-0 ${cls}`} />
            <span className={m.status === "pending" ? "text-ink-500" : "text-ink-800"}>
              {m.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
