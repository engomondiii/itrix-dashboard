import { UsersIcon } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";

export function EmptyLeadState() {
  return (
    <EmptyState
      icon={UsersIcon}
      title="No leads match these filters"
      description="Adjust or clear the filters to see more results."
    />
  );
}
