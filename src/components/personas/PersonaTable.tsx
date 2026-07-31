"use client";

import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { QueryState } from "@/components/ui/query-state";
import { SearchInput } from "@/components/ui/search-input";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useListControls, type SortValue } from "@/hooks/useListControls";
import { usePersonas } from "@/hooks/usePersonas";
import { ROUTES } from "@/constants/routes";
import {
  FUNCTIONAL_FAMILIES,
  FUNCTIONAL_FAMILY_LABEL,
  type FunctionalFamily,
  type Persona,
} from "@/types/persona";

import { ValidationStatusBadge } from "./ValidationStatusBadge";

type SortKey = "persona" | "family" | "department" | "status";

const SORT_ACCESSORS: Record<SortKey, (p: Persona) => SortValue> = {
  persona: (p) => p.title,
  family: (p) => FUNCTIONAL_FAMILY_LABEL[p.functionalFamily] ?? p.functionalFamily,
  department: (p) => p.targetDepartment || null,
  status: (p) => p.validationStatus,
};

/**
 * The persona registry browser — READ-ONLY.
 *
 * There are no edit controls and there must not be: the registry is seeded from
 * the target-account workbook by `seed_personas`, and editing a persona from a
 * CRM screen would silently fork the blueprint the Pitch Agent resolves against.
 */
export function PersonaTable() {
  const [family, setFamily] = useState<FunctionalFamily | null>(null);
  const query = usePersonas(family ?? undefined);
  const personas = query.data;

  const { search, sort, toggleSort, pageItems, total, unfilteredTotal, pagination } =
    useListControls<Persona, SortKey>({
      items: personas,
      searchText: (p) => `${p.title} ${p.id} ${p.targetDepartment} ${p.pitchArchetype}`,
      sortAccessors: SORT_ACCESSORS,
      filterKey: family ?? "all",
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={search.value}
          onChange={(e) => search.setValue(e.target.value)}
          placeholder="Search persona, id, department…"
          wrapperClassName="w-full sm:w-72"
        />
        <div className="flex flex-wrap gap-1.5">
          <Button
            size="sm"
            variant={family === null ? "default" : "outline"}
            onClick={() => setFamily(null)}
          >
            All families
          </Button>
          {FUNCTIONAL_FAMILIES.map((f) => (
            <Button
              key={f}
              size="sm"
              variant={family === f ? "default" : "outline"}
              onClick={() => setFamily(f)}
            >
              {FUNCTIONAL_FAMILY_LABEL[f]}
            </Button>
          ))}
        </div>
      </div>

      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        hasData={Boolean(personas)}
        label="the persona registry"
        error={query.error}
      />

      {personas && personas.length === 0 && (
        <EmptyState
          title="No personas"
          description="The registry has not been seeded yet — run `seed_personas`."
        />
      )}

      {personas && personas.length > 0 && total === 0 && (
        <EmptyState
          title="No matches"
          description={`No persona matches this search (${unfilteredTotal} in this view).`}
        />
      )}

      {total > 0 && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHead sortKey="persona" sort={sort} onToggle={toggleSort}>
                  Persona
                </SortableTableHead>
                <SortableTableHead sortKey="family" sort={sort} onToggle={toggleSort}>
                  Family
                </SortableTableHead>
                <SortableTableHead sortKey="department" sort={sort} onToggle={toggleSort}>
                  Target department
                </SortableTableHead>
                <TableHead>Pitch archetype</TableHead>
                <SortableTableHead sortKey="status" sort={sort} onToggle={toggleSort}>
                  Status
                </SortableTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link
                      href={ROUTES.persona(p.id)}
                      className="font-medium text-ink-primary hover:underline"
                    >
                      {p.title}
                    </Link>
                    <div className="font-mono text-micro text-ink-secondary">{p.id}</div>
                  </TableCell>
                  <TableCell className="text-sec text-ink-secondary">
                    {FUNCTIONAL_FAMILY_LABEL[p.functionalFamily]}
                  </TableCell>
                  <TableCell className="text-sec text-ink-secondary">
                    {p.targetDepartment}
                    <Badge variant="neutral" className="ml-1.5">
                      hypothesis
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sec text-ink-secondary">
                    {p.pitchArchetype}
                  </TableCell>
                  <TableCell>
                    <ValidationStatusBadge status={p.validationStatus} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            page={pagination.page}
            pageCount={pagination.pageCount}
            onPageChange={pagination.setPage}
            total={total}
            pageSize={pagination.pageSize}
            className="mt-3"
          />
        </div>
      )}
    </div>
  );
}
