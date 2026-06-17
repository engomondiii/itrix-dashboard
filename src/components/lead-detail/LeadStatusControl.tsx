"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEAD_STATUSES, type LeadStatus } from "@/constants/statuses";
import { useLeadActions } from "@/hooks/useLeadActions";

export function LeadStatusControl({
  leadId,
  status,
}: {
  leadId: string;
  status: LeadStatus;
}) {
  const { setStatus } = useLeadActions(leadId);
  return (
    <Select value={status} onValueChange={(v) => setStatus.mutate(v as LeadStatus)}>
      <SelectTrigger size="sm" className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LEAD_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
