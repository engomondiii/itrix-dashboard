"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLeadActions } from "@/hooks/useLeadActions";
import { MOCK_TEAM } from "@/mocks/users";

const UNASSIGNED = "__none__";

export function LeadOwnerControl({
  leadId,
  owner,
}: {
  leadId: string;
  owner: string | null;
}) {
  const { assign } = useLeadActions(leadId);
  return (
    <Select
      value={owner ?? UNASSIGNED}
      onValueChange={(v) => assign.mutate(v === UNASSIGNED ? null : v)}
    >
      <SelectTrigger size="sm" className="w-full">
        <SelectValue>{(v) => (v === UNASSIGNED ? "Unassigned" : String(v))}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
        {MOCK_TEAM.map((m) => (
          <SelectItem key={m.id} value={m.name}>
            {m.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
