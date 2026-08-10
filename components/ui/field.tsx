'use client';

/**
 * A labelled input (or textarea, via `multiline`).
 *
 * Small, but it is the one place accessibility is easy to get right once and
 * easy to get wrong everywhere. The version this replaces rendered:
 *
 *     <label className="...">{label}</label>
 *     <input type={type} value={value} ... />
 *     {error && <p className="text-red-500">{error}</p>}
 *
 * Three problems, all invisible to a sighted mouse user and all blocking for
 * anyone else:
 *
 * - The label was not associated with the input. No `htmlFor`, no `id`, so
 *   clicking the label did nothing and a screen reader announced the field as
 *   unlabelled.
 * - The error was not linked to the input, so it was never announced.
 * - The error was conveyed by colour alone.
 *
 * Fixed below with a generated id, `aria-describedby`, `aria-invalid`, and a
 * live region. None of it costs anything at runtime.
 *
 * The focus ring uses `focus` (not `focus-visible`) on purpose: unlike a
 * button, a text field should show its ring on mouse focus too — the ring is
 * "you are typing here", not just keyboard-navigation feedback.
 */

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';

/**
 * Shared control styling — exported so config-driven inputs (the entity
 * form's selects and textareas) render identically to hand-placed Fields
 * without duplicating the class list in two files.
 */
export function fieldControlClass(hasError: boolean): string {
  return [
    'block w-full rounded-md border bg-transparent px-3 py-2 text-sm',
    // Border and ring both animate; hover strengthens the border so the
    // control reads as interactive before it is focused.
    'transition-[border-color,box-shadow] duration-150',
    'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-background',
    hasError
      ? 'border-destructive focus:ring-destructive/40'
      : 'border-input hover:border-muted-foreground/50 focus:ring-ring',
  ].join(' ');
}

interface FieldBaseProps {
  label: string;
  /** Validation message. Presence marks the field invalid. */
  error?: string | null;
  /** Persistent guidance shown below the input. */
  hint?: ReactNode;
  /** Render a textarea instead of an input. */
  multiline?: boolean;
  /** `multiline` only. Visible rows before scrolling. */
  rows?: number;
}

export type FieldProps = FieldBaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> &
  Pick<TextareaHTMLAttributes<HTMLTextAreaElement>, 'rows'>;

export const Field = forwardRef<HTMLInputElement | HTMLTextAreaElement, FieldProps>(
  function Field(
    { label, error, hint, className = '', required, multiline, rows, ...inputProps },
    ref,
  ) {
    // useId is stable across server and client render, so it does not cause a
    // hydration mismatch the way Math.random() or a module counter would.
    const id = useId();
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    const describedBy = [error ? errorId : null, hint ? hintId : null]
      .filter(Boolean)
      .join(' ');

    const sharedProps = {
      id,
      required,
      'aria-invalid': error ? true : undefined,
      'aria-describedby': describedBy || undefined,
      className: `${fieldControlClass(Boolean(error))} ${className}`,
    };

    return (
      <div className="mb-4">
        <label htmlFor={id} className="mb-1 block text-sm font-medium">
          {label}
          {required && (
            <>
              {/* The asterisk is decorative; the input's `required` attribute
                  is what a screen reader announces. Hiding it here avoids
                  "label star" being read out. */}
              <span aria-hidden="true" className="ml-0.5 text-destructive">
                *
              </span>
              <span className="sr-only"> (required)</span>
            </>
          )}
        </label>

        {multiline ? (
          <textarea
            {...(inputProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
            {...sharedProps}
            rows={rows ?? 4}
            ref={ref as React.Ref<HTMLTextAreaElement>}
          />
        ) : (
          <input
            {...(inputProps as InputHTMLAttributes<HTMLInputElement>)}
            {...sharedProps}
            ref={ref as React.Ref<HTMLInputElement>}
          />
        )}

        {hint && (
          <p id={hintId} className="mt-1 text-xs text-muted-foreground">
            {hint}
          </p>
        )}

        {error && (
          // role="alert" announces the message when it appears, rather than
          // only when the field is next focused. The fade keeps the layout
          // shift from feeling like a flicker.
          <p
            id={errorId}
            role="alert"
            className="mt-1 animate-fade-in text-xs text-destructive"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

export default Field;
