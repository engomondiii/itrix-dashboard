'use client';

/**
 * Volume control for Today bands: render the first few, expand in chunks.
 * A band with 100 rows must never be 100 cards on the home screen — the
 * count in the band header already tells the whole story; the cards are
 * for acting on the top of the pile.
 */

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useCopy } from '@/lib/i18n/locale-provider';

const INITIAL = 6;
const CHUNK = 20;

export function useCapped<T>(rows: T[]) {
  const [limit, setLimit] = useState(INITIAL);
  const visible = rows.slice(0, limit);
  const remaining = rows.length - visible.length;
  return {
    visible,
    remaining,
    showMore: () => setLimit((l) => l + CHUNK),
  };
}

export function ShowMore({ remaining, onClick }: { remaining: number; onClick: () => void }) {
  const copy = useCopy();
  if (remaining <= 0) return null;
  return (
    <Button size="sm" variant="ghost" onClick={onClick} className="w-full text-muted-foreground">
      {copy.today.showMore(Math.min(remaining, 20), remaining)}
    </Button>
  );
}
