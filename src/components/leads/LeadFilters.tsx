"use client";

import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRODUCT_ROUTES, type ProductRoute } from "@/constants/products";
import { LEAD_STATUSES, type LeadStatus } from "@/constants/statuses";
import { useFilterStore } from "@/store/filterStore";

const ALL = "all";

export function LeadFilters() {
  const { route, status, set, reset } = useFilterStore();
  const active = route != null || status != null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={route ?? ALL}
        onValueChange={(v) =>
          set({ route: v === ALL ? undefined : (v as ProductRoute) })
        }
      >
        <SelectTrigger size="sm" className="w-[140px]">
          <SelectValue>{(v) => (v === ALL ? "All routes" : String(v))}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All routes</SelectItem>
          {PRODUCT_ROUTES.map((r) => (
            <SelectItem key={r} value={r}>
              {r}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={status ?? ALL}
        onValueChange={(v) =>
          set({ status: v === ALL ? undefined : (v as LeadStatus) })
        }
      >
        <SelectTrigger size="sm" className="w-[150px]">
          <SelectValue>{(v) => (v === ALL ? "All statuses" : String(v))}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All statuses</SelectItem>
          {LEAD_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {active && (
        <Button variant="ghost" size="sm" onClick={reset}>
          <XIcon />
          Clear
        </Button>
      )}
    </div>
  );
}
