"use client";

import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccounts } from "@/hooks/useAccounts";
import { ROUTES } from "@/constants/routes";

/**
 * Accounts · no conversation yet, beside the conversion widgets (Surface 2
 * v7.1 §07 Phase 3).
 *
 * TWO NUMBERS, NEVER ONE BLENDED NUMBER. The conversion aggregates exclude
 * accounts without conversations (R70); this tile carries their count
 * separately. A blended "signups" figure would be the metric that quietly
 * makes open registration look like demand.
 *
 * Hidden entirely when the endpoint is not served yet — a zero that means
 * "no route" is not a zero.
 */
export function AccountsWithoutConversationTile() {
  const { data, isError, isLoading } = useAccounts();

  if (isLoading || isError || data === undefined) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accounts · no conversation yet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-kpi font-semibold tabular-nums text-ink-primary">
          {data.length}
        </p>
        <p className="text-caption text-ink-secondary">
          Self-serve workspaces that have not said anything. Counted here and{" "}
          <Link href={ROUTES.accounts} className="font-medium text-ink-primary hover:underline">
            listed there
          </Link>{" "}
          — never blended into conversion, because a registration is not a
          qualification.
        </p>
      </CardContent>
    </Card>
  );
}
