import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { MOCK_LEADS } from "@/mocks/leads";
import type { Lead, LeadListItem } from "@/types/lead";
import type { Paginated } from "@/types/api";

function toListItem(l: Lead): LeadListItem {
  return {
    id: l.id,
    visitorName: l.visitorName,
    company: l.company,
    industry: l.industry,
    role: l.role,
    productRoute: l.productRoute,
    commercialPath: l.commercialPath,
    primaryPain: l.primaryPain,
    score: l.score,
    tier: l.tier,
    status: l.status,
    owner: l.owner,
    specialRights: l.specialRights,
    submittedAt: l.submittedAt,
  };
}

export async function GET(req: Request) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  // Real mode: forward to Django (thin proxy).
  if (!siteConfig.useMocks) {
    const r = await djangoFetch(`/leads/?${searchParams}`);
    return djangoJson(r);
  }

  // Mock mode: filter / sort / search / paginate the fixtures.
  const tier = searchParams.get("tier");
  const route = searchParams.get("route");
  const status = searchParams.get("status");
  const owner = searchParams.get("owner");
  const search = searchParams.get("search")?.toLowerCase().trim();
  const sort = searchParams.get("sort") ?? "submittedAt";
  const dir = searchParams.get("dir") === "asc" ? 1 : -1;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.max(1, Number(searchParams.get("pageSize") ?? 25));

  let rows = MOCK_LEADS.filter((l) => {
    if (tier && l.tier !== Number(tier)) return false;
    if (route && l.productRoute !== route) return false;
    if (status && l.status !== status) return false;
    if (owner && (l.owner ?? "") !== owner) return false;
    if (search) {
      const hay = `${l.company ?? ""} ${l.visitorName ?? ""} ${l.email} ${l.industry} ${l.primaryPain}`.toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });

  rows = [...rows].sort((a, b) => {
    const av = a[sort as keyof Lead];
    const bv = b[sort as keyof Lead];
    if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
    return String(av).localeCompare(String(bv)) * dir;
  });

  const count = rows.length;
  const start = (page - 1) * pageSize;
  const results = rows.slice(start, start + pageSize).map(toListItem);

  const body: Paginated<LeadListItem> = { results, count, page, pageSize };
  return NextResponse.json(body);
}
