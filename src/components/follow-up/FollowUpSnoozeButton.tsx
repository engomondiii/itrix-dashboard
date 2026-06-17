"use client";

import { AlarmClockIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useFollowUpActions } from "@/hooks/useFollowUp";

export function FollowUpSnoozeButton({ taskId }: { taskId: string }) {
  const { snooze } = useFollowUpActions();
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => snooze.mutate(taskId)}
      disabled={snooze.isPending}
      aria-label="Snooze 24 hours"
    >
      <AlarmClockIcon />
      Snooze
    </Button>
  );
}
