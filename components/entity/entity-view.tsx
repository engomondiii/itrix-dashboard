'use client';

/**
 * Read-only detail view.
 *
 * Uses `<dl>/<dt>/<dd>` rather than a grid of `<div>`s. A description list is
 * what this markup *is*, and screen readers announce the pairing — a
 * two-column grid of divs reads as an undifferentiated run of text.
 *
 * Falls back to `config.columns` when `config.detail` is absent, so a config
 * written for a table gets a usable detail view for free.
 *
 * Each section renders as a card. The grouping was already semantic
 * (`section` on the field config); the border makes it visible, which
 * matters once a record has a dozen fields — a flat two-column run of
 * label/value pairs has no scannable structure.
 */

import Link from 'next/link';
import { useMemo, type ReactNode } from 'react';

import type { BaseEntity, ColumnConfig, EntityConfig } from '@/lib/entity/types';
import { defaultTone, formatRelative, formatValue, readPath } from '@/lib/entity/format';

const toneClass: Record<string, string> = {
  neutral: 'bg-muted text-muted-foreground',
  success: 'bg-positive/12 text-positive',
  warning: 'bg-accent/15 text-accent',
  danger: 'bg-destructive/12 text-destructive',
  info: 'bg-primary/10 text-primary',
};

interface EntityViewProps<T extends BaseEntity> {
  config: EntityConfig<T>;
  entity?: T;
  isLoading?: boolean;
  /**
   * Rendered top-right, above the sections — the page passes its Edit /
   * Delete buttons here so actions sit with the record they act on rather
   * than in the page chrome.
   */
  actions?: ReactNode;
}

export function EntityView<T extends BaseEntity>({
  config,
  entity,
  isLoading,
  actions,
}: EntityViewProps<T>) {
  const fields = useMemo(
    () => config.detail ?? config.columns ?? [],
    [config.detail, config.columns],
  );

  // Preserves declaration order: a Map keyed by section name keeps groups in
  // the order their first field appears, so the author controls the layout by
  // ordering the array rather than by an extra index property.
  const sections = useMemo(() => {
    const grouped = new Map<string, ColumnConfig<T>[]>();
    for (const field of fields) {
      const key = field.section ?? '';
      const list = grouped.get(key) ?? [];
      list.push(field);
      grouped.set(key, list);
    }
    return Array.from(grouped.entries());
  }, [fields]);

  if (isLoading || !entity) {
    return (
      <div className="animate-fade-in rounded-lg border border-border bg-card p-4 sm:p-5" aria-busy="true">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={String(field.key)}>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                {field.header}
              </dt>
              <dd className="mt-1 h-4 w-2/3 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </dl>
      </div>
    );
  }

  // `BaseModel` timestamps, when present. Typed as unknown reads because a
  // template cannot know which of its consumers' entities carry them.
  const createdAt = readPath(entity, 'created_at');
  const updatedAt = readPath(entity, 'updated_at');

  return (
    <div className="animate-fade-in space-y-4">
      {actions && <div className="flex justify-end gap-2">{actions}</div>}

      {sections.map(([sectionName, sectionFields]) => (
        <section
          key={sectionName}
          className="overflow-hidden rounded-lg border border-border bg-card"
        >
          {sectionName && (
            <h3 className="border-b border-border bg-muted/40 px-4 py-2.5 text-sm font-semibold sm:px-5">
              {sectionName}
            </h3>
          )}
          <dl className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
            {sectionFields.map((field) => (
              <div
                key={String(field.key)}
                className={field.span === 2 ? 'sm:col-span-2' : ''}
              >
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {field.header}
                </dt>
                <dd className="mt-1 text-sm">
                  <DetailValue entity={entity} field={field} />
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      {(typeof createdAt === 'string' || typeof updatedAt === 'string') && (
        <p className="px-1 text-xs text-muted-foreground">
          {typeof createdAt === 'string' && <>Created {formatRelative(createdAt)}</>}
          {typeof createdAt === 'string' && typeof updatedAt === 'string' && ' · '}
          {typeof updatedAt === 'string' && <>Updated {formatRelative(updatedAt)}</>}
        </p>
      )}
    </div>
  );
}

const linkClass =
  'underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:text-primary hover:decoration-primary';

function DetailValue<T extends BaseEntity>({
  entity,
  field,
}: {
  entity: T;
  field: ColumnConfig<T>;
}) {
  if (field.render) return <>{field.render(entity)}</>;

  const value = readPath(entity, String(field.key));

  if (field.format === 'badge') {
    const tone = field.tone ? field.tone(value, entity) : defaultTone(value);
    return (
      <span
        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${toneClass[tone]}`}
      >
        {String(value ?? '—')}
      </span>
    );
  }

  if (field.format === 'email' && value) {
    return (
      <a href={`mailto:${String(value)}`} className={linkClass}>
        {String(value)}
      </a>
    );
  }

  if (field.format === 'link' && value) {
    return (
      <a
        href={String(value)}
        // noreferrer is not decoration: without it the target page can reach
        // back through window.opener and navigate this tab.
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        {String(value)}
      </a>
    );
  }

  if (field.format === 'image' && value) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={String(value)} alt="" className="h-20 w-20 rounded object-cover" />;
  }

  const text = formatValue(value, field.format);

  // `href` makes the display text a link — the related-record case
  // ("ACME Corp" → /customers/42). Internal paths go through next/link for
  // client-side navigation; anything absolute opens in a new tab.
  if (field.href && value !== null && value !== undefined && value !== '') {
    const target = field.href(entity);
    if (target.startsWith('/') && !target.startsWith('//')) {
      return (
        <Link href={target} className={linkClass}>
          {text}
        </Link>
      );
    }
    return (
      <a href={target} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {text}
      </a>
    );
  }

  return <>{text}</>;
}
