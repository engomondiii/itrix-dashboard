"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { AccountOriginBadge } from "@/components/customers/AccountOriginBadge";
import { VerificationBadge } from "@/components/customers/VerificationBadge";
import { formatTimeAgo } from "@/lib/formatting";
import type { AccountListItem } from "@/types/account";

import { ResendVerificationDialog } from "./ResendVerificationDialog";

/**
 * One silent self-serve account (Surface 2 v7.1 §04.8).
 *
 * NO LINK TO A LEAD PAGE ON PURPOSE. A Lead row exists (at ARRIVED), but
 * linking there would put this population one click from the queues R70
 * excludes it from — and there is nothing on that page yet: no conversation,
 * no score, no tier. The row's one action is the reasoned resend; anything
 * else an operator does with a silent account is a decision they make on the
 * record, not a workflow this table hands them.
 */
export function AccountRow({ account }: { account: AccountListItem }) {
  const [resendOpen, setResendOpen] = useState(false);

  return (
    <TableRow>
      <TableCell>
        <span className="font-medium text-ink-primary">{account.email}</span>
        {(account.fullName || account.organization) && (
          <div className="text-caption text-ink-secondary">
            {[account.fullName, account.organization].filter(Boolean).join(" · ")}
          </div>
        )}
      </TableCell>

      <TableCell>
        <span className="flex flex-wrap gap-1">
          <AccountOriginBadge origin={account.accountOrigin} />
          <VerificationBadge
            verified={account.emailVerified}
            verifiedAt={account.emailVerifiedAt}
          />
        </span>
      </TableCell>

      <TableCell className="text-sec text-ink-secondary">
        {formatTimeAgo(account.registeredAt)}
      </TableCell>

      <TableCell className="text-sec text-ink-secondary">
        {account.lastSignInAt ? (
          formatTimeAgo(account.lastSignInAt)
        ) : (
          <span className="italic">never</span>
        )}
      </TableCell>

      <TableCell className="text-right">
        {!account.emailVerified && (
          <>
            <Button size="sm" variant="outline" onClick={() => setResendOpen(true)}>
              Resend verification
            </Button>
            <ResendVerificationDialog
              clientId={account.clientId}
              email={account.email}
              open={resendOpen}
              onOpenChange={setResendOpen}
            />
          </>
        )}
      </TableCell>
    </TableRow>
  );
}
