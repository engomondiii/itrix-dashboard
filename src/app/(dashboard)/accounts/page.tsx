"use client";

import { UserPlusIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/empty-state";
import { QueryState } from "@/components/ui/query-state";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AccountRow } from "@/components/accounts/AccountRow";
import { useAccounts } from "@/hooks/useAccounts";

/**
 * Accounts · no conversation yet (Surface 2 v7.1 §04.8).
 *
 * The one place the silent self-serve population appears. R70 keeps it out of
 * every lead queue, tier count, conversion rate, follow-up motion and SLA
 * clock — an SLA on somebody who has asked for nothing is an alarm that fires
 * for no reason and trains operators to ignore alarms. The moment a first
 * turn lands, an account leaves this list and becomes a lead like any other.
 *
 * Visible, countable, sortable by age — and not chaseable. An operator who
 * decides to reach out is making a decision on the record rather than working
 * a queue that told them to.
 */
export default function AccountsPage() {
  const query = useAccounts();
  const rows = query.data;

  return (
    <>
      <PageHeader
        title="Accounts"
        description="Self-serve workspaces with no conversation yet. Not pipeline — a registration is not a qualification."
      />

      <div className="space-y-4">
        <QueryState
          isLoading={query.isLoading}
          isError={query.isError}
          hasData={Boolean(rows)}
          label="accounts without a conversation"
          error={query.error}
        />

        {rows && rows.length === 0 && (
          <EmptyState
            icon={UserPlusIcon}
            title="No silent accounts"
            description="Every self-serve account has started a conversation — there is nothing waiting here."
          />
        )}

        {rows && rows.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Provenance</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Last sign-in</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((account) => (
                  <AccountRow key={account.clientId} account={account} />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
}
