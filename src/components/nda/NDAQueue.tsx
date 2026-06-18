"use client";

import { useEffect, useState } from "react";
import { FileSignatureIcon } from "lucide-react";

import { NDAStatusCard } from "@/components/nda/NDAStatusCard";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dashboardConfig } from "@/config/dashboard.config";
import { useNdaQueue } from "@/hooks/useNda";
import { NDA_STATUSES } from "@/types/nda";

const ALL = "__all__";

export function NDAQueue() {
  const pageSize = dashboardConfig.pageSize;
  const [status, setStatus] = useState<string>(ALL);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Debounce the search box so we don't refetch on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, isFetching } = useNdaQueue({
    status: status === ALL ? undefined : status,
    search: search || undefined,
    page,
    pageSize,
  });

  const records = data?.results ?? [];
  const total = data?.count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search company or signer"
          wrapperClassName="w-full sm:w-64"
        />
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(String(v));
            setPage(1);
          }}
        >
          <SelectTrigger size="sm" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {NDA_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="size-5" />
        </div>
      ) : records.length === 0 ? (
        <EmptyState
          icon={FileSignatureIcon}
          title="No NDAs match"
          description="Try a different status or search term — NDAs appear here once a lead reaches the NDA stage."
        />
      ) : (
        <>
          <div
            className={`grid grid-cols-1 gap-3 lg:grid-cols-2 ${isFetching ? "opacity-60" : ""}`}
          >
            {records.map((nda) => (
              <NDAStatusCard key={nda.id} nda={nda} />
            ))}
          </div>
          <Pagination
            page={page}
            pageCount={pageCount}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
