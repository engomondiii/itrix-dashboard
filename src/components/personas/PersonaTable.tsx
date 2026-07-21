"use client";

import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { QueryState } from "@/components/ui/query-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { usePersonas } from "@/hooks/usePersonas";
import { ROUTES } from "@/constants/routes";
import {
  FUNCTIONAL_FAMILIES,
  FUNCTIONAL_FAMILY_LABEL,
  type FunctionalFamily,
} from "@/types/persona";

import { ValidationStatusBadge } from "./ValidationStatusBadge";

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

  return (
    <div className="space-y-4">
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

      {personas && personas.length > 0 && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Persona</TableHead>
                <TableHead>Family</TableHead>
                <TableHead>Target department</TableHead>
                <TableHead>Pitch archetype</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {personas.map((p) => (
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
        </div>
      )}
    </div>
  );
}
