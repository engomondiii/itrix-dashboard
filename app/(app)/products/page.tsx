'use client';

/**
 * Worked example — delete this route once you have your own.
 *
 * It is here as the executable answer to "how much do I have to write to get
 * a working admin screen", and as a regression test: it exercises typed
 * columns, formatters, badges, row and bulk actions, the form with a zod
 * schema (create AND edit), the detail view, the import dialog, and the
 * table/cards view toggle. If the entity layer breaks, this stops compiling.
 *
 * Everything below is configuration only. The equivalent in the source
 * project was a similar amount of config on top of 21,892 lines of framework;
 * this sits on about 3,400, tests included.
 */

import { useState } from 'react';
import { z } from 'zod';

import {
  EntityForm,
  EntityImport,
  EntityList,
  EntityView,
  useEntityList,
} from '@/components/entity';
import type { EntityConfig } from '@/components/entity';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { createResource } from '@/lib/api/hooks';
import { Endpoints } from '@/lib/api/endpoints';

// --- The entity ------------------------------------------------------------

interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  status: 'draft' | 'active' | 'archived';
  stock: number;
  // Optional on purpose: the demo seed omits them, which is exactly the shape
  // of a real rollout — new fields arrive on new records first. The form,
  // view, and schema below all tolerate their absence.
  description?: string;
  product_url?: string;
  created_at: string;
  [key: string]: unknown;
}

const products = createResource<Product>(Endpoints.Example.List);

// --- Validation ------------------------------------------------------------
// Passing a schema rather than relying on the derived fallback: `price` has a
// real rule (non-negative) that presence-checking cannot express.
const productSchema = z.object({
  sku: z.string().min(1, 'SKU is required.').max(32),
  name: z.string().min(1, 'Name is required.'),
  price: z.coerce.number().nonnegative('Price cannot be negative.'),
  stock: z.coerce.number().int('Stock must be a whole number.').nonnegative(),
  status: z.enum(['draft', 'active', 'archived']),
  // `.or(z.literal(''))` because an untouched optional input reports '', not
  // undefined — without it, leaving the field empty fails url validation.
  description: z.string().max(500, 'Keep it under 500 characters.').optional().or(z.literal('')),
  product_url: z.string().url('Enter a full URL (https://…).').optional().or(z.literal('')),
});

// --- Config ----------------------------------------------------------------
// `key` is `keyof Product`, so a typo here is a compile error.

const productFilters: EntityConfig<Product>['filters'] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'active', label: 'Active' },
      { value: 'archived', label: 'Archived' },
    ],
  },
  // A range is two filters, not a special type — and each end gets a label
  // in your own words.
  { key: 'price', label: 'Min price', type: 'text', lookup: 'gte' },
  { key: 'price', label: 'Max price', type: 'text', lookup: 'lte' },
];

interface ProductHandlers {
  onView: (p: Product) => void;
  onEdit: (p: Product) => void;
  onDuplicate: (p: Product) => void;
  onArchive: (p: Product) => void;
  onDelete: (p: Product) => void;
}

function buildConfig(handlers: ProductHandlers) {
  const config: EntityConfig<Product> = {
    name: 'Product',
    namePlural: 'Products',

    searchable: true,
    searchPlaceholder: 'Search by name or SKU…',
    defaultSort: '-created_at',
    selectable: true,
    exportable: true,
    exportFormats: ['csv', 'xlsx'],
    trashable: true,
    // Two desktop presentations of the same rows; the choice lives in the
    // URL alongside sort and page.
    views: ['table', 'cards'],

    filters: productFilters,

    columns: [
      { key: 'sku', header: 'SKU', sortable: true, primary: true },
      { key: 'name', header: 'Name', sortable: true, primary: true },
      { key: 'price', header: 'Price', format: 'currency', align: 'right', sortable: true },
      { key: 'stock', header: 'Stock', format: 'number', align: 'right' },
      { key: 'status', header: 'Status', format: 'badge' },
      {
        key: 'created_at',
        header: 'Created',
        format: 'relative',
        sortable: true,
        hideOnMobile: true,
      },
    ],

    // Detail view fields, grouped into headed section cards. `columns` would
    // be used verbatim if this were omitted.
    detail: [
      { key: 'sku', header: 'SKU', section: 'Identity' },
      { key: 'name', header: 'Name', section: 'Identity', span: 2 },
      { key: 'status', header: 'Status', format: 'badge', section: 'Identity' },
      { key: 'price', header: 'Price', format: 'currency', section: 'Commercials' },
      { key: 'stock', header: 'Stock on hand', format: 'number', section: 'Commercials' },
      { key: 'description', header: 'Description', section: 'Details', span: 2 },
      { key: 'product_url', header: 'Product page', format: 'link', section: 'Details', span: 2 },
      { key: 'created_at', header: 'Created', format: 'datetime', section: 'Record' },
    ],

    // Form fields share the same section names as the detail view, so create,
    // edit, and view all present the record with one structure.
    fields: [
      { key: 'sku', label: 'SKU', required: true, createOnly: true, span: 1,
        section: 'Identity', help: 'Cannot be changed after creation.' },
      { key: 'name', label: 'Name', required: true, span: 1, section: 'Identity' },
      { key: 'price', label: 'Price', type: 'currency', required: true, span: 1,
        section: 'Commercials' },
      { key: 'stock', label: 'Stock on hand', type: 'number', required: true, span: 1,
        section: 'Commercials' },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        section: 'Commercials',
        options: [
          { value: 'draft', label: 'Draft' },
          { value: 'active', label: 'Active' },
          { value: 'archived', label: 'Archived' },
        ],
      },
      { key: 'description', label: 'Description', type: 'textarea', rows: 3, span: 2,
        section: 'Details', help: 'Optional. Shown on the detail view.' },
      { key: 'product_url', label: 'Product page URL', type: 'url', span: 2,
        section: 'Details', placeholder: 'https://…' },
    ],

    // Five actions: the first renders inline, the rest collapse into an
    // accessible overflow menu. Raise `inlineActionCount` to show more.
    inlineActionCount: 1,
    rowActions: [
      { id: 'view', label: 'View', onSelect: handlers.onView },
      { id: 'edit', label: 'Edit', onSelect: handlers.onEdit },
      { id: 'duplicate', label: 'Duplicate', onSelect: handlers.onDuplicate },
      {
        id: 'archive',
        label: 'Archive',
        visible: (row) => row.status !== 'archived',
        onSelect: handlers.onArchive,
      },
      {
        id: 'delete',
        label: 'Delete',
        tone: 'danger',
        confirm: (row) => `Delete ${row.name}? It moves to the trash.`,
        // Hidden rather than disabled: an archived product has no delete
        // path, so showing a greyed-out button just invites a support ticket.
        visible: (row) => row.status !== 'archived',
        onSelect: handlers.onDelete,
      },
    ],

    onRowClick: handlers.onView,
  };

  return config;
}

// --- Page ------------------------------------------------------------------

function ProductsScreen() {
  const [mode, setMode] = useState<'list' | 'create' | 'edit' | 'view'>('list');
  const [selected, setSelected] = useState<Product | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const { toast } = useToast();

  // `filters` is passed to the hook as well as the config: the hook needs to
  // know which query parameters are its own, so it leaves everything else in
  // the URL alone.
  const controller = useEntityList<Product>({
    defaultSort: '-created_at',
    // 10, not the 20 default: the demo seed is 18 rows, and a pager that
    // never appears looks like a pager that does not exist.
    pageSize: 10,
    filters: productFilters,
  });
  const list = products.useList(controller.queryParams);
  const create = products.useCreate();
  const update = products.useUpdate();
  const remove = products.useDelete();
  const bulkDelete = products.useBulkDelete();
  const bulkImport = products.useBulkImport();

  const config = buildConfig({
    onView: (product) => {
      setSelected(product);
      setMode('view');
    },
    onEdit: (product) => {
      setSelected(product);
      setMode('edit');
    },
    // Real mutations, not console placeholders — the actions demonstrate the
    // toast round trip: mutate, await, confirm.
    onDuplicate: async (product) => {
      const copy = await create.mutateAsync({
        sku: `${product.sku}-copy`,
        name: `${product.name} (copy)`,
        price: product.price,
        stock: product.stock,
        status: 'draft',
      });
      toast({ title: `Duplicated as ${copy.sku}`, tone: 'success' });
    },
    onArchive: async (product) => {
      await update.mutateAsync({ id: product.id, data: { status: 'archived' } });
      toast({ title: `${product.name} archived`, tone: 'success' });
    },
    onDelete: async (product) => {
      await remove.mutateAsync(product.id);
      toast({
        title: `${product.name} moved to trash`,
        description: 'Restore it from the Trash view.',
      });
    },
  });

  config.bulkActions = [
    {
      id: 'bulk-delete',
      label: 'Delete selected',
      tone: 'danger',
      confirm: (rows) => `Delete ${rows.length} product(s)?`,
      onSelect: async (rows) => {
        const result = await bulkDelete.mutateAsync(rows.map((r) => r.id));
        toast({ title: `${result.count} product(s) moved to trash` });
      },
    },
  ];

  return (
    // Full-width inside the shell's padded content column — the (app) layout
    // owns the chrome and the guard; a page renders content only.
    <section>
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {mode === 'create'
            ? 'New product'
            : mode === 'edit'
              ? `Edit ${selected?.name ?? ''}`
              : mode === 'view'
                ? selected?.name
                : 'Products'}
        </h1>
        {mode === 'list' ? (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
              Import
            </Button>
            <Button size="sm" onClick={() => setMode('create')}>
              New product
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setMode('list')}>
            Back to list
          </Button>
        )}
      </header>

      {mode === 'list' && (
        <EntityList
          config={config}
          controller={controller}
          data={list.data}
          isLoading={list.isLoading}
          error={list.error ? { message: 'Could not load products.' } : null}
          onRetry={() => list.refetch()}
          onExport={(format) => products.exportRows(controller.queryParams, format)}
        />
      )}

      {mode === 'create' && (
        <EntityForm
          config={config}
          schema={productSchema}
          onSubmit={async (values) => {
            await create.mutateAsync(values);
            toast({ title: 'Product created', tone: 'success' });
            setMode('list');
          }}
          onCancel={() => setMode('list')}
        />
      )}

      {/* Same form, same schema — `initial` switches it to edit mode:
          createOnly fields render disabled, and submit goes through PATCH. */}
      {mode === 'edit' && selected && (
        <EntityForm
          config={config}
          schema={productSchema}
          initial={selected}
          onSubmit={async (values) => {
            const saved = await update.mutateAsync({ id: selected.id, data: values });
            toast({ title: `${saved.name} saved`, tone: 'success' });
            setSelected(saved);
            setMode('list');
          }}
          onCancel={() => setMode('list')}
        />
      )}

      {/* Actions live in the view's own slot, next to the record they act
          on — the page header keeps only navigation. */}
      {mode === 'view' && selected && (
        <EntityView
          config={config}
          entity={selected}
          actions={
            <Button size="sm" onClick={() => setMode('edit')}>
              Edit
            </Button>
          }
        />
      )}

      <EntityImport
        open={importOpen}
        onOpenChange={setImportOpen}
        entityName="Product"
        onImport={async (file) => {
          const result = await bulkImport.mutateAsync(file);
          if (result.imported > 0) {
            toast({ title: `Imported ${result.imported} product(s)`, tone: 'success' });
          }
          return result;
        }}
        onDownloadTemplate={() => products.downloadImportTemplate('csv')}
      />
    </section>
  );
}

// The (app) layout supplies the auth guard — no per-page ProtectedRoute.
export default function ProductsPage() {
  return <ProductsScreen />;
}
