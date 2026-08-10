'use client';

/**
 * A data table with search, sort, pagination, selection and row actions.
 *
 * Roughly 400 lines against the source project's 2,296, because it carries
 * three view modes' worth of behaviour rather than eight, and delegates
 * formatting, state and data fetching to modules that already exist.
 *
 * Accessibility is not optional here and is easy to get wrong in a table:
 * sortable headers are real `<button>`s inside `<th scope="col">` and carry
 * `aria-sort`; the select-all checkbox exposes an indeterminate state; the
 * loading skeleton is `aria-busy` rather than a silent swap. None of it costs
 * layout.
 */

import { useId, useMemo } from 'react';

import type {
  BaseEntity,
  BulkAction,
  ColumnConfig,
  EntityConfig,
} from '@/lib/entity/types';
import { defaultTone, formatValue, readPath } from '@/lib/entity/format';
import type { EntityListController } from '@/lib/entity/use-entity-list';
import type { Paginated } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { EntityFilters } from './entity-filters';
import { ActionMenu } from './action-menu';

// Token-derived, not raw palette. Each tone is one semantic colour at 12%
// for the fill and full strength for the text, so a single set of classes
// works in both themes — the token itself already shifts between them.
const toneClass: Record<string, string> = {
  neutral: 'bg-muted text-muted-foreground',
  success: 'bg-positive/12 text-positive',
  warning: 'bg-accent/15 text-accent',
  danger: 'bg-destructive/12 text-destructive',
  info: 'bg-primary/10 text-primary',
};

interface EntityListProps<T extends BaseEntity> {
  config: EntityConfig<T>;
  controller: EntityListController<T>;
  data?: Paginated<T>;
  isLoading?: boolean;
  error?: { message: string } | null;
  onRetry?: () => void;
  /** Wire to `resource.exportRows(controller.queryParams, format)`. */
  onExport?: (format: 'csv' | 'xlsx') => void | Promise<void>;
}

export function EntityList<T extends BaseEntity>({
  config,
  controller,
  data,
  isLoading,
  error,
  onRetry,
  onExport,
}: EntityListProps<T>) {
  const columns = config.columns ?? [];
  // Memoized because `?? []` builds a fresh array on every render, which would
  // make the selection memo below recompute each time and defeat its purpose.
  const rows = useMemo(() => data?.results ?? [], [data?.results]);
  const selectable = config.selectable || (config.bulkActions?.length ?? 0) > 0;

  const selectedRows = useMemo(
    () => rows.filter((row) => controller.isSelected(row.id)),
    [rows, controller],
  );

  if (error) {
    return (
      <div role="alert" className="rounded-md border border-destructive/40 p-6 text-center">
        <p className="text-sm text-destructive">{error.message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="mt-3">
            Try again
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Toolbar
        config={config}
        controller={controller}
        selectedRows={selectedRows}
        onExport={onExport}
      />

      {config.filters?.length ? (
        <EntityFilters filters={config.filters} controller={controller} />
      ) : null}

      {/* Desktop cards — only when the config offers the view and the URL
          selects it. A browsing presentation of the same rows; selection and
          row actions stay with the table, where they have a column. */}
      {controller.state.view === 'cards' && (
        <div className="hidden gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <MobileCard key={String(row.id)} row={row} config={config} />
          ))}
          {!isLoading && rows.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm opacity-70">
              {config.emptyMessage ?? `No ${config.namePlural ?? `${config.name}s`} yet.`}
            </p>
          )}
        </div>
      )}

      {/* Desktop table. Hidden on small screens in favour of the cards below —
          a horizontally-scrolling data table on a phone is unusable, and
          `overflow-x: auto` alone just hides the problem.

          Both views are rendered and CSS picks one. The cost is duplicated
          DOM nodes; the alternative — a JS media-query hook that renders only
          one — costs a hydration mismatch (the server cannot know the
          viewport) and a flash of the wrong layout. Tailwind's `hidden` is
          `display: none`, which removes the inactive copy from the
          accessibility tree too, so nothing is announced twice. */}
      <div
        className={[
          'overflow-x-auto rounded-md border',
          controller.state.view === 'cards' ? 'hidden' : 'hidden sm:block',
        ].join(' ')}
      >
        <table className="w-full text-sm" aria-busy={isLoading || undefined}>
          <caption className="sr-only">
            {config.namePlural ?? `${config.name}s`}
          </caption>
          <thead className="border-b bg-muted/50 text-left">
            <tr>
              {selectable && (
                <th scope="col" className="w-10 px-3 py-2">
                  <SelectAllCheckbox controller={controller} rows={rows} />
                </th>
              )}

              {columns.map((column) => (
                <HeaderCell
                  key={String(column.key)}
                  column={column}
                  controller={controller}
                />
              ))}

              {config.rowActions?.length ? (
                <th scope="col" className="w-10 px-3 py-2">
                  <span className="sr-only">Actions</span>
                </th>
              ) : null}
            </tr>
          </thead>

          <tbody>
            {isLoading && rows.length === 0 ? (
              <SkeletonRows
                columns={columns.length + (selectable ? 1 : 0)}
                pageSize={controller.state.pageSize}
              />
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + 1}
                  className="px-3 py-10 text-center text-sm opacity-70"
                >
                  {config.emptyMessage ??
                    (controller.state.search
                      ? `No ${config.namePlural ?? 'results'} match “${controller.state.search}”.`
                      : `No ${config.namePlural ?? `${config.name}s`} yet.`)}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <Row
                  key={String(row.id)}
                  row={row}
                  config={config}
                  controller={controller}
                  selectable={selectable}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 sm:hidden">
        {rows.map((row) => (
          <MobileCard key={String(row.id)} row={row} config={config} />
        ))}
        {!isLoading && rows.length === 0 && (
          <p className="py-10 text-center text-sm opacity-70">
            {config.emptyMessage ?? `No ${config.namePlural ?? `${config.name}s`} yet.`}
          </p>
        )}
      </div>

      <ListStatusBar data={data} controller={controller} config={config} />
    </div>
  );
}

// ---------------------------------------------------------------------------

function Toolbar<T extends BaseEntity>({
  config,
  controller,
  selectedRows,
  onExport,
}: {
  config: EntityConfig<T>;
  controller: EntityListController<T>;
  selectedRows: T[];
  onExport?: (format: 'csv' | 'xlsx') => void | Promise<void>;
}) {
  const searchId = useId();
  const hasSelection = controller.selectedCount > 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {config.searchable !== false && (
        <div className="min-w-[12rem] flex-1">
          <label htmlFor={searchId} className="sr-only">
            Search {config.namePlural ?? config.name}
          </label>
          <input
            id={searchId}
            type="search"
            value={controller.searchInput}
            onChange={(e) => controller.setSearchInput(e.target.value)}
            placeholder={config.searchPlaceholder ?? 'Search…'}
            className="w-full rounded-md border bg-transparent px-3 py-1.5 text-sm transition-colors hover:border-ring/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      )}

      {hasSelection && config.bulkActions?.length ? (
        <div className="flex items-center gap-2">
          {/* Announced, because a selection count that only exists visually
              tells a screen-reader user nothing about why these buttons
              appeared. */}
          <span aria-live="polite" className="text-sm opacity-70">
            {controller.selectedCount} selected
          </span>
          {config.bulkActions.map((action) => (
            <BulkActionButton
              key={action.id}
              action={action}
              rows={selectedRows}
              onDone={controller.clearSelection}
            />
          ))}
          <Button variant="ghost" size="sm" onClick={controller.clearSelection}>
            Clear
          </Button>
        </div>
      ) : null}

      {config.exportable &&
        onExport &&
        (config.exportFormats ?? ['csv']).map((format) => (
          <Button key={format} variant="outline" size="sm" onClick={() => onExport(format)}>
            Export {format.toUpperCase()}
          </Button>
        ))}

      {(config.views?.length ?? 0) > 1 && (
        // aria-pressed toggles, not a select: two or three options with
        // instant effect are a button group; a dropdown hides the current
        // state behind a click.
        <div role="group" aria-label="List view" className="flex rounded-md border">
          {config.views!.map((view) => (
            <button
              key={view}
              type="button"
              aria-pressed={controller.state.view === view}
              onClick={() => controller.setView(view)}
              className={[
                'px-2 py-1.5 text-sm capitalize transition-colors first:rounded-l-md last:rounded-r-md',
                controller.state.view === view
                  ? 'bg-muted font-medium'
                  : 'opacity-70 hover:bg-muted/50 hover:opacity-100',
              ].join(' ')}
            >
              {view}
            </button>
          ))}
        </div>
      )}

      {config.trashable && (
        // A trash view is a filter, not a separate page: it keeps the same
        // columns, search and sort, and the backend serves it from the same
        // endpoint via ?is_deleted=true.
        <Button
          variant="outline"
          size="sm"
          aria-pressed={controller.state.showDeleted}
          onClick={() => controller.setShowDeleted(!controller.state.showDeleted)}
          className={controller.state.showDeleted ? 'bg-muted' : ''}
        >
          {controller.state.showDeleted ? 'Showing trash' : 'Trash'}
        </Button>
      )}
    </div>
  );
}

function BulkActionButton<T extends BaseEntity>({
  action,
  rows,
  onDone,
}: {
  action: BulkAction<T>;
  rows: T[];
  onDone: () => void;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        const message =
          typeof action.confirm === 'function' ? action.confirm(rows) : action.confirm;
        // `confirm()` blocks the main thread and cannot be styled. It is here
        // so the template has no dialog dependency — swap it for your own
        // modal; the shape of this call is what matters.
        if (message && !window.confirm(message)) return;
        await action.onSelect(rows);
        onDone();
      }}
      className={
        action.tone === 'danger'
          ? 'border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive'
          : ''
      }
    >
      {action.label}
    </Button>
  );
}

function SelectAllCheckbox<T extends BaseEntity>({
  controller,
  rows,
}: {
  controller: EntityListController<T>;
  rows: T[];
}) {
  const allSelected = rows.length > 0 && rows.every((row) => controller.isSelected(row.id));
  const someSelected = rows.some((row) => controller.isSelected(row.id));

  return (
    <input
      type="checkbox"
      checked={allSelected}
      // `indeterminate` is a DOM property with no HTML attribute, so it has to
      // be set through a ref. Without it, "some rows selected" renders
      // identically to "none selected".
      ref={(node) => {
        if (node) node.indeterminate = !allSelected && someSelected;
      }}
      onChange={() => controller.toggleAll(rows)}
      aria-label={allSelected ? 'Deselect all rows' : 'Select all rows'}
      className="h-4 w-4"
    />
  );
}

function HeaderCell<T extends BaseEntity>({
  column,
  controller,
}: {
  column: ColumnConfig<T>;
  controller: EntityListController<T>;
}) {
  const direction = column.sortable ? controller.sortDirection(String(column.key)) : null;

  return (
    <th
      scope="col"
      style={{ width: column.width }}
      // aria-sort is what tells assistive tech the table is sorted and how.
      // A visual arrow alone does not.
      aria-sort={
        direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : undefined
      }
      className={[
        'px-3 py-2 font-medium',
        column.align === 'right' ? 'text-right' : '',
        column.align === 'center' ? 'text-center' : '',
        column.hideOnMobile ? 'hidden md:table-cell' : '',
      ].join(' ')}
    >
      {column.sortable ? (
        <button
          type="button"
          onClick={() => controller.toggleSort(String(column.key))}
          className="group inline-flex items-center gap-1 rounded transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {column.header}
          <span
            aria-hidden="true"
            className="opacity-50 transition-opacity group-hover:opacity-100"
          >
            {direction === 'asc' ? '▲' : direction === 'desc' ? '▼' : '↕'}
          </span>
        </button>
      ) : (
        column.header
      )}
    </th>
  );
}

function Cell<T extends BaseEntity>({ row, column }: { row: T; column: ColumnConfig<T> }) {
  if (column.render) return <>{column.render(row)}</>;

  const value = readPath(row, String(column.key));

  if (column.format === 'badge') {
    const tone = column.tone ? column.tone(value, row) : defaultTone(value);
    return (
      <span
        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${toneClass[tone]}`}
      >
        {String(value ?? '—')}
      </span>
    );
  }

  if (column.format === 'email' && value) {
    return (
      <a href={`mailto:${String(value)}`} className="underline">
        {String(value)}
      </a>
    );
  }

  if (column.format === 'image' && value) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={String(value)} alt="" className="h-8 w-8 rounded object-cover" />;
  }

  return <>{formatValue(value, column.format)}</>;
}

function Row<T extends BaseEntity>({
  row,
  config,
  controller,
  selectable,
}: {
  row: T;
  config: EntityConfig<T>;
  controller: EntityListController<T>;
  selectable: boolean;
}) {
  const clickable = Boolean(config.onRowClick);
  const selected = controller.isSelected(row.id);

  return (
    <tr
      className={[
        'border-b transition-colors last:border-0',
        selected ? 'bg-accent/40 hover:bg-accent/50' : 'hover:bg-muted/50',
        clickable ? 'cursor-pointer' : '',
      ].join(' ')}
      onClick={clickable ? () => config.onRowClick?.(row) : undefined}
    >
      {selectable && (
        <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={controller.isSelected(row.id)}
            onChange={() => controller.toggleSelected(row.id)}
            aria-label={`Select row ${row.id}`}
            className="h-4 w-4"
          />
        </td>
      )}

      {(config.columns ?? []).map((column) => (
        <td
          key={String(column.key)}
          className={[
            'px-3 py-2',
            column.align === 'right' ? 'text-right' : '',
            column.align === 'center' ? 'text-center' : '',
            column.hideOnMobile ? 'hidden md:table-cell' : '',
          ].join(' ')}
        >
          <Cell row={row} column={column} />
        </td>
      ))}

      {config.rowActions?.length ? (
        <td className="px-3 py-2 text-right" onClick={(e) => e.stopPropagation()}>
          <ActionMenu
            actions={config.rowActions}
            row={row}
            inlineCount={config.inlineActionCount ?? 1}
          />
        </td>
      ) : null}
    </tr>
  );
}

function MobileCard<T extends BaseEntity>({
  row,
  config,
}: {
  row: T;
  config: EntityConfig<T>;
}) {
  const columns = config.columns ?? [];
  // `primary` columns form the card's title line; everything else becomes a
  // label/value pair. Falling back to the first column means a config that
  // never sets `primary` still produces a sensible card.
  const primary = columns.filter((c) => c.primary);
  const heading = primary.length ? primary : columns.slice(0, 1);
  const body = columns.filter((c) => !heading.includes(c));

  const clickable = Boolean(config.onRowClick);

  return (
    <button
      type="button"
      onClick={clickable ? () => config.onRowClick?.(row) : undefined}
      className={[
        'w-full rounded-md border p-3 text-left transition-[box-shadow,border-color]',
        clickable ? 'cursor-pointer hover:border-accent hover:shadow-md' : 'cursor-default',
      ].join(' ')}
    >
      <div className="mb-2 font-medium">
        {heading.map((column) => (
          <Cell key={String(column.key)} row={row} column={column} />
        ))}
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
        {body.map((column) => (
          <div key={String(column.key)} className="contents">
            <dt className="opacity-60">{column.header}</dt>
            <dd className="text-right">
              <Cell row={row} column={column} />
            </dd>
          </div>
        ))}
      </dl>
    </button>
  );
}

function SkeletonRows({ columns, pageSize }: { columns: number; pageSize: number }) {
  // Matches the page size so the table does not resize when data arrives —
  // a skeleton of the wrong height causes a layout shift, which is worse than
  // no skeleton.
  return (
    <>
      {Array.from({ length: Math.min(pageSize, 8) }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b last:border-0">
          {Array.from({ length: columns + 1 }).map((__, cellIndex) => (
            <td key={cellIndex} className="px-3 py-3">
              <div className="h-3 animate-pulse rounded bg-muted" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

/**
 * The list's status line — always rendered once data exists.
 *
 * The previous version returned `null` for a single page, which meant a
 * short list showed no result count, no page-size control, and no evidence
 * of the active sort. Invisible state reads as missing features: the state
 * lives in the URL, but nobody reads URLs. This bar says it in words —
 * "18 results · sorted by Created, newest first" — and the pager buttons
 * appear only when there is somewhere to go.
 */
function ListStatusBar<T extends BaseEntity>({
  data,
  controller,
  config,
}: {
  data?: Paginated<T>;
  controller: EntityListController<T>;
  config: EntityConfig<T>;
}) {
  if (!data) return null;

  const { current_page, total_pages, count } = data;
  const { ordering, search, pageSize } = controller.state;

  // Translate `-price` into the words a human used when they clicked the
  // header. Falls back to the raw field name for a defaultSort that has no
  // visible column.
  const sortField = ordering.replace(/^-/, '');
  const sortColumn = (config.columns ?? []).find((column) => String(column.key) === sortField);
  const sortLabel = ordering
    ? `${sortColumn?.header ?? sortField}, ${ordering.startsWith('-') ? 'descending' : 'ascending'}`
    : null;

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm"
    >
      <p className="text-muted-foreground">
        {count} {count === 1 ? 'result' : 'results'}
        {search && <> · matching “{search}”</>}
        {sortLabel && <> · sorted by {sortLabel}</>}
      </p>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1.5 text-muted-foreground">
          Rows
          <select
            value={pageSize}
            onChange={(e) => controller.setPageSize(Number(e.target.value))}
            className="rounded-md border border-border bg-transparent px-1.5 py-1 text-sm transition-colors hover:border-ring/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        {total_pages > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground" data-numeric>
              Page {current_page} of {total_pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={current_page <= 1}
              onClick={() => controller.setPage(current_page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={current_page >= total_pages}
              onClick={() => controller.setPage(current_page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
