'use client';

/**
 * A destructive-ish action that needs a written reason (reject a draft,
 * release/quarantine a file). Renders as a button; clicking expands an
 * inline reason input with confirm/cancel — no dialog, the card stays put.
 *
 * `minChars` mirrors any server-side minimum so the round-trip failure is
 * caught before it happens; the confirm stays disabled until met.
 */

import { useState } from 'react';

import { Button } from '@/components/ui/button';

interface ReasonActionProps {
  label: string;
  /** Placeholder that tells the writer what a good reason contains. */
  placeholder: string;
  minChars?: number;
  busy?: boolean;
  variant?: 'outline' | 'destructive';
  onConfirm: (reason: string) => void;
}

export function ReasonAction({
  label,
  placeholder,
  minChars = 0,
  busy = false,
  variant = 'outline',
  onConfirm,
}: ReasonActionProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');

  if (!open) {
    return (
      <Button size="sm" variant={variant} disabled={busy} onClick={() => setOpen(true)}>
        {label}
      </Button>
    );
  }

  const tooShort = reason.trim().length < minChars;

  return (
    <div className="flex w-full items-center gap-2 sm:w-auto">
      <input
        autoFocus
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder={placeholder}
        className="h-8 w-full min-w-0 rounded-md border border-input bg-card px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-56"
      />
      <Button
        size="sm"
        variant={variant}
        disabled={busy || tooShort}
        title={tooShort && minChars > 0 ? `At least ${minChars} characters` : undefined}
        onClick={() => {
          onConfirm(reason.trim());
          setOpen(false);
          setReason('');
        }}
      >
        {label}
      </Button>
      <Button size="sm" variant="ghost" disabled={busy} onClick={() => setOpen(false)}>
        Cancel
      </Button>
    </div>
  );
}
