"use client";

import { CalendarClockIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFollowUpActions } from "@/hooks/useFollowUp";

/** Deliberate next-touch presets (label → hours from now). */
const PRESETS: { label: string; hours: number }[] = [
  { label: "Tomorrow", hours: 24 },
  { label: "In 3 days", hours: 72 },
  { label: "Next week", hours: 168 },
];

export function FollowUpRescheduleMenu({ taskId }: { taskId: string }) {
  const { reschedule } = useFollowUpActions();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            size="sm"
            variant="ghost"
            disabled={reschedule.isPending}
            aria-label="Reschedule follow-up"
          />
        }
      >
        <CalendarClockIcon />
        Reschedule
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Next touch</DropdownMenuLabel>
        {PRESETS.map((p) => (
          <DropdownMenuItem
            key={p.hours}
            onClick={() =>
              reschedule.mutate({
                id: taskId,
                dueAt: new Date(Date.now() + p.hours * 3600_000).toISOString(),
              })
            }
          >
            {p.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
