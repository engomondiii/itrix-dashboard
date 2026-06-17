"use client";

import { CheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useFollowUpActions } from "@/hooks/useFollowUp";

export function FollowUpCompleteButton({ taskId }: { taskId: string }) {
  const { complete } = useFollowUpActions();
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => complete.mutate(taskId)}
      disabled={complete.isPending}
    >
      <CheckIcon />
      Done
    </Button>
  );
}
