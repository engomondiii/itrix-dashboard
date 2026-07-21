"use client";

import { SupportQueue } from "@/components/support/SupportQueue";

/**
 * This customer's support requests, inside their detail page.
 *
 * Reuses the queue rather than rendering a second, simpler list: an operator
 * looking at one customer and an operator looking at the whole queue must see
 * the same urgency ordering and the same SLA state, or one of the two views is
 * quietly lying about how bad things are.
 */
export function CustomerSupportPanel({ clientId }: { clientId: string }) {
  return <SupportQueue clientId={clientId} />;
}
