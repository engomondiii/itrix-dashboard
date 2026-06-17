import type { LeadStatus } from "@/constants/statuses";

/** Status labels are already display-ready; passthrough keeps a single call site. */
export function formatStatus(status: LeadStatus): string {
  return status;
}
