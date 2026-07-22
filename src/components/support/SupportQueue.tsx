"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { QueryState } from "@/components/ui/query-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSupportQueue } from "@/hooks/useSupport";
import { ROUTES } from "@/constants/routes";
import { formatTimeAgo } from "@/lib/formatting";
import {
  SUPPORT_STATUS_INTENT,
  SUPPORT_STATUS_LABEL,
  SUPPORT_URGENCY_INTENT,
  SUPPORT_URGENCY_LABEL,
} from "@/types/support";

import { SupportSlaTimer } from "./SupportSlaTimer";

/**
 * The support queue, breaching first.
 *
 * A BLOCKING ROW IS NOT JUST A TICKET. Step 1 of the customer-first precedence
 * rule keys off exactly this: while a blocking request is open, every
 * commercial action for that customer is suppressed. The summary line says so,
 * because an operator wondering why the cockpit refuses to offer an expansion
 * should be able to find the answer in one place.
 */
export function SupportQueue({ clientId }: { clientId?: string }) {
  const query = useSupportQueue(clientId);
  const data = query.data;

  return (
    <div className="space-y-4">
      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        hasData={Boolean(data)}
        label="the support queue"
        error={query.error}
      />

      {data && (
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={data.summary.open > 0 ? "info" : "neutral"}>
            {data.summary.open} open
          </Badge>
          {data.summary.breaching > 0 && (
            <Badge variant="error">{data.summary.breaching} breaching SLA</Badge>
          )}
          {data.summary.blocking > 0 && (
            <Badge variant="error">
              {data.summary.blocking} blocking — commercial actions suppressed
            </Badge>
          )}
        </div>
      )}

      {data && data.results.length === 0 && (
        <EmptyState
          title="Nothing open"
          description="No support requests match. Requests appear here the moment a customer raises one."
        />
      )}

      {data && data.results.length > 0 && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request</TableHead>
                {!clientId && <TableHead>Customer</TableHead>}
                <TableHead>Urgency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Owner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.results.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="max-w-[38ch]">
                    <Link
                      href={ROUTES.supportRequest(r.id)}
                      className="line-clamp-1 font-medium text-ink-primary hover:underline"
                    >
                      {r.subject}
                    </Link>
                    <div className="text-micro text-ink-secondary">
                      raised {formatTimeAgo(r.createdAt)}
                    </div>
                  </TableCell>

                  {!clientId && (
                    <TableCell className="text-sec text-ink-secondary">
                      <Link href={ROUTES.customer(r.clientId)} className="hover:underline">
                        {r.company}
                      </Link>
                    </TableCell>
                  )}

                  <TableCell>
                    <Badge variant={SUPPORT_URGENCY_INTENT[r.urgency]}>
                      {SUPPORT_URGENCY_LABEL[r.urgency]}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge variant={SUPPORT_STATUS_INTENT[r.status]}>
                      {SUPPORT_STATUS_LABEL[r.status]}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <SupportSlaTimer dueAt={r.slaDueAt} resolved={r.status === "resolved"} />
                  </TableCell>

                  <TableCell className="text-sec text-ink-secondary">
                    {r.owner ?? <span className="italic text-ink-secondary">Unassigned</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
