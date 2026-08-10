'use client';

/**
 * Shared form-feedback helpers for standalone (non-entity) forms — settings
 * panels, auth pages, anything hand-rolled around `Field`.
 *
 * `useFieldErrors` is the client half of the API error contract: feed any
 * caught error to `absorb()` and field errors land next to their inputs via
 * `errorFor()`, while object-level errors fall through to `formError`. This
 * is the same round trip the login page demonstrates, extracted once instead
 * of re-implemented per page.
 */

import { useState } from 'react';

import { normalizeError, type FieldError } from '@/lib/api/errors';

export function useFieldErrors() {
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  return {
    fieldErrors,
    formError,
    errorFor: (field: string) => fieldErrors.find((e) => e.field === field)?.message ?? null,
    clear: () => {
      setFieldErrors([]);
      setFormError(null);
    },
    absorb: (error: unknown) => {
      const normalized = normalizeError(error);
      setFieldErrors(normalized.fieldErrors);
      if (!normalized.fieldErrors.some((e) => e.field)) setFormError(normalized.message);
    },
  };
}

export function FormAlert({ message, tone }: { message: string; tone: 'error' | 'success' }) {
  return (
    <div
      // `alert` interrupts a screen reader; `status` waits its turn. An error
      // has earned the interruption, a confirmation has not.
      role={tone === 'error' ? 'alert' : 'status'}
      className={
        tone === 'error'
          ? 'mb-4 animate-fade-in rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive'
          : 'mb-4 animate-fade-in rounded-md border border-positive/40 bg-positive/10 px-3 py-2 text-sm text-positive'
      }
    >
      {message}
    </div>
  );
}
