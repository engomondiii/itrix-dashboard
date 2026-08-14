'use client';

/**
 * Who this lead works for — the card that used to be a single line of grey
 * text under the page title.
 *
 * The email lived in that line, which made it read like a label rather than
 * something you act on. Here it is a real mail link with a copy button next
 * to it, and the company facts sit around it as a table you can scan.
 *
 * The last block is the reason the card exists at all: other leads from the
 * same company. Working one lead while a colleague works another from the
 * same organization — neither knowing — is the failure this closes.
 *
 * Caveat worth knowing: `company` is free text on the lead, so the match is a
 * string search. Only `clientId` is a real relation, and it only exists once
 * the company has become a customer account.
 */

import Link from 'next/link';
import { useState } from 'react';
import { Building2, Check, Copy, ExternalLink } from 'lucide-react';

import { Panel } from '@/components/shared/panel';
import { Stamp } from '@/components/shared/timestamp';
import { useLeads } from '@/lib/leads/hooks';
import type { LeadDetail } from '@/lib/leads/types';
import { cn } from '@/lib/utils';

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      aria-label={`Copy ${label}`}
      title={`Copy ${label}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // Clipboard is permission-gated and refuses outside a secure
          // context. The address is selectable either way, so a failed copy
          // is a non-event — not worth a toast.
        }
      }}
      className="shrink-0 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {copied ? <Check className="h-3 w-3 text-positive" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3 py-1.5">
      <dt className="w-20 shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 flex-1 text-sm">{children}</dd>
    </div>
  );
}

/** Everything after the @, which is the company's real identifier far more often than its name. */
function domainOf(email: string): string {
  const at = email.lastIndexOf('@');
  return at === -1 ? '' : email.slice(at + 1);
}

function OtherLeads({ lead }: { lead: LeadDetail }) {
  // Only worth asking when there's a name to match on; an empty search would
  // return the entire lead table.
  const siblings = useLeads({ search: lead.company, pageSize: 20 });
  const others = (siblings.data?.results ?? []).filter(
    (row) => row.id !== lead.id && row.company === lead.company,
  );

  if (others.length === 0) return null;

  return (
    <div className="mt-3 border-t border-border/60 pt-3">
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">
        Also from {lead.company}
      </p>
      <ul className="space-y-1">
        {others.map((row) => (
          <li key={row.id} className="flex items-baseline gap-2 text-xs">
            <Link href={`/leads/${row.id}`} className="min-w-0 flex-1 truncate hover:underline">
              {row.visitorName || 'Unknown contact'}
              {row.role ? <span className="text-muted-foreground"> · {row.role}</span> : null}
            </Link>
            <span className="shrink-0 text-muted-foreground">{row.status}</span>
            <span className="shrink-0 text-muted-foreground">
              <Stamp at={row.submittedAt} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CompanyCard({ lead }: { lead: LeadDetail }) {
  const domain = domainOf(lead.email);

  return (
    <Panel
      title="Company"
      action={
        lead.clientId ? (
          <Link
            href={`/customers/${lead.clientId}`}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            Account <ExternalLink className="h-3 w-3" />
          </Link>
        ) : null
      }
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </span>
        <span className="min-w-0">
          <span className={cn('block truncate font-medium', !lead.company && 'text-muted-foreground')}>
            {lead.company || 'Company not given'}
          </span>
          {domain && <span className="block truncate text-xs text-muted-foreground">{domain}</span>}
        </span>
      </div>

      <dl className="divide-y divide-border/40">
        {lead.industry && <Row label="Industry">{lead.industry}</Row>}
        {(lead.visitorName || lead.role) && (
          <Row label="Contact">
            {lead.visitorName || 'Unnamed'}
            {lead.role && <span className="text-muted-foreground"> · {lead.role}</span>}
          </Row>
        )}
        <Row label="Email">
          {lead.email ? (
            <span className="flex items-center gap-1">
              <a href={`mailto:${lead.email}`} className="min-w-0 truncate hover:underline">
                {lead.email}
              </a>
              <CopyButton value={lead.email} label="email address" />
            </span>
          ) : (
            <span className="text-muted-foreground">Not shared yet</span>
          )}
        </Row>
        <Row label="First seen">
          <Stamp at={lead.submittedAt} absolute />
        </Row>
      </dl>

      {/* Gated here rather than inside: an empty search returns every lead. */}
      {lead.company && <OtherLeads lead={lead} />}
    </Panel>
  );
}
