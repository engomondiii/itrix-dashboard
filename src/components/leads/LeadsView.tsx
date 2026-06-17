"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { LeadSearch } from "@/components/leads/LeadSearch";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { LeadTierNav } from "@/components/leads/LeadTierNav";
import { LeadBulkActions } from "@/components/leads/LeadBulkActions";
import { LeadTable } from "@/components/leads/LeadTable";
import { LeadExportButton } from "@/components/leads/LeadExportButton";
import { EmptyLeadState } from "@/components/leads/EmptyLeadState";
import { Pagination } from "@/components/ui/pagination";
import { Spinner } from "@/components/ui/spinner";
import { dashboardConfig } from "@/config/dashboard.config";
import { useLeads } from "@/hooks/useLeads";
import { useFilterStore } from "@/store/filterStore";
import type { Tier } from "@/constants/tiers";

export function LeadsView({
  lockedTier,
  title = "Leads",
  description,
}: {
  lockedTier?: Tier;
  title?: string;
  description?: string;
}) {
  const f = useFilterStore();
  const pageSize = dashboardConfig.pageSize;

  const { data, isLoading, isFetching } = useLeads({
    tier: lockedTier ?? f.tier,
    route: f.route,
    status: f.status,
    owner: f.owner,
    search: f.search || undefined,
    sort: f.sort,
    dir: f.dir,
    page: f.page,
    pageSize,
  });

  const rows = data?.results ?? [];
  const total = data?.count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={<LeadExportButton rows={rows} />}
      />

      <LeadTierNav current={lockedTier} />

      <div className="mt-3 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <LeadSearch />
          <LeadFilters />
        </div>

        <LeadBulkActions />

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner className="size-5" />
          </div>
        ) : rows.length === 0 ? (
          <EmptyLeadState />
        ) : (
          <>
            <LeadTable rows={rows} loading={isFetching} />
            <Pagination
              page={f.page}
              pageCount={pageCount}
              total={total}
              pageSize={pageSize}
              onPageChange={(p) => f.set({ page: p })}
            />
          </>
        )}
      </div>
    </>
  );
}
