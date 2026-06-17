import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import { ROUTES } from "@/constants/routes";
import type { Notification } from "@/types/notification";

export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  if (!siteConfig.useMocks) {
    const r = await djangoFetch("/notifications/");
    return NextResponse.json(await r.json(), { status: r.status });
  }

  const now = Date.now();
  const results: Notification[] = [
    {
      id: "n1",
      kind: "tier1_lead",
      title: "New Tier 1 lead — Cerebra Edge",
      body: "Score 97 · ALPHA Core · escalate within 24h.",
      href: ROUTES.leadsTier(1),
      read: false,
      createdAt: new Date(now - 25 * 60_000).toISOString(),
    },
    {
      id: "n2",
      kind: "sla_breach",
      title: "3 follow-ups past SLA",
      href: ROUTES.followUpOverdue,
      read: false,
      createdAt: new Date(now - 2 * 3600_000).toISOString(),
    },
    {
      id: "n3",
      kind: "nda_signed",
      title: "NDA signed — Atlas Foundry",
      href: ROUTES.nda,
      read: true,
      createdAt: new Date(now - 6 * 3600_000).toISOString(),
    },
  ];
  return NextResponse.json({ results, count: results.length, unread: results.filter((n) => !n.read).length });
}
