'use client';

/**
 * Band 5 — NDAs in flight: `required` (we owe them a document) and `sent`
 * (waiting on their signature). Sending needs a signer email and belongs to
 * the lead screen; the card just gets you there fast.
 */

import { useNdaInFlight } from '@/lib/today/hooks';
import { formatRelative } from '@/lib/entity/format';
import { QueueCard } from '../queue-card';
import { TodayBand } from '../today-band';

export function NdaBand() {
  const nda = useNdaInFlight();
  const rows = nda.data?.results ?? [];

  return (
    <TodayBand
      title="NDAs in flight"
      hint="to send, or waiting on a signature"
      count={rows.length}
      isLoading={nda.isLoading}
      tone="neutral"
    >
      {rows.map((row) => (
        <QueueCard
          key={row.id}
          tone="neutral"
          href={`/leads/${row.leadId}`}
          title={
            <>
              {row.company || row.leadName}
              <span className="text-muted-foreground">
                {' '}
                · {row.status === 'required' ? 'needs sending' : 'awaiting signature'}
              </span>
            </>
          }
          meta={
            row.status === 'sent' && row.sentAt ? (
              <>
                sent {formatRelative(row.sentAt)} to {row.signerEmail || 'unknown signer'}
              </>
            ) : (
              <>requested {formatRelative(row.requestedAt)} · {row.docType}</>
            )
          }
        />
      ))}
    </TodayBand>
  );
}
