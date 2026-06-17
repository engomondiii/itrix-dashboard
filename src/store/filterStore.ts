import { create } from "zustand";

import type { SortDir } from "@/types/api";
import type { ProductRoute } from "@/constants/products";
import type { LeadStatus } from "@/constants/statuses";
import type { Tier } from "@/constants/tiers";

export interface LeadFilterState {
  tier?: Tier;
  route?: ProductRoute;
  status?: LeadStatus;
  owner?: string;
  search: string;
  sort: string;
  dir: SortDir;
  page: number;

  set: (patch: Partial<Omit<LeadFilterState, "set" | "reset" | "toggleSort">>) => void;
  toggleSort: (key: string) => void;
  reset: () => void;
}

const initial = {
  tier: undefined,
  route: undefined,
  status: undefined,
  owner: undefined,
  search: "",
  sort: "submittedAt",
  dir: "desc" as SortDir,
  page: 1,
};

export const useFilterStore = create<LeadFilterState>((set) => ({
  ...initial,
  // Any filter change resets pagination to page 1 (unless the patch sets page).
  set: (patch) =>
    set((s) => ({ ...s, page: "page" in patch ? patch.page! : 1, ...patch })),
  toggleSort: (key) =>
    set((s) => ({
      sort: key,
      dir: s.sort === key && s.dir === "asc" ? "desc" : "asc",
      page: 1,
    })),
  reset: () => set({ ...initial }),
}));
