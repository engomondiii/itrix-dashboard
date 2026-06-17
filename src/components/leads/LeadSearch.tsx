"use client";

import { SearchInput } from "@/components/ui/search-input";
import { useFilterStore } from "@/store/filterStore";

export function LeadSearch() {
  const search = useFilterStore((s) => s.search);
  const set = useFilterStore((s) => s.set);

  return (
    <SearchInput
      value={search}
      onChange={(e) => set({ search: e.target.value })}
      placeholder="Search company, name, email…"
      wrapperClassName="w-full sm:w-64"
      aria-label="Search leads"
    />
  );
}
