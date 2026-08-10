/**
 * MSW request handlers for demo mode — a faithful in-browser stand-in for the
 * Django starter backend.
 *
 * Faithful is the point. These handlers speak the same contracts the real
 * backend does — the error envelope from `apps/core/exceptions.py`, the
 * pagination shape from `apps/core/pagination.py`, Django filter lookups
 * (`price__gte`), simplejwt-style token refresh — so everything the template
 * showcases (field-level error rendering, the refresh mutex, trash/restore,
 * bulk actions, CSV export) exercises its real code path, not a shortcut.
 *
 * State lives in `sessionStorage`, so creates, edits and the signed-in
 * session survive a reload — which is exactly what makes the session-restore
 * flow in `auth-context.tsx` visible in demo mode — but nothing outlives the
 * tab.
 *
 * Wrong credentials return the same envelope a real dj-rest-auth backend
 * would, deliberately: the login page's error handling is one of the things
 * worth demonstrating. Sign in with demo@example.com / demo1234.
 */

import { delay, http, HttpResponse } from 'msw';

import { parseCsvRecords } from '@/lib/entity/csv';
import { DEMO_CREDENTIALS, DEMO_USER, seedProducts, type DemoProduct } from './data';

// ---------------------------------------------------------------------------
// Persistence (per-tab)
// ---------------------------------------------------------------------------

const DB_KEY = 'demo:products';
const SESSION_KEY = 'demo:signed-in';

function loadProducts(): DemoProduct[] {
  try {
    const raw = sessionStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw) as DemoProduct[];
  } catch {
    // Corrupt or unavailable storage — fall through to a fresh seed.
  }
  const seeded = seedProducts();
  saveProducts(seeded);
  return seeded;
}

function saveProducts(products: DemoProduct[]): void {
  try {
    sessionStorage.setItem(DB_KEY, JSON.stringify(products));
  } catch {
    // Storage full or blocked; demo continues in memory for this page.
  }
}

const signedIn = {
  get: () => sessionStorage.getItem(SESSION_KEY) === '1',
  set: (value: boolean) =>
    value ? sessionStorage.setItem(SESSION_KEY, '1') : sessionStorage.removeItem(SESSION_KEY),
};

// ---------------------------------------------------------------------------
// Envelope helpers — mirror apps/core/exceptions.py exactly
// ---------------------------------------------------------------------------

interface FieldIssue {
  field: string | null;
  code: string | null;
  message: string;
}

function errorEnvelope(
  status: number,
  type: string,
  message: string,
  detail: FieldIssue[] = [],
) {
  return HttpResponse.json(
    { error: { type, message, detail, request_id: `demo-${Date.now()}` } },
    { status },
  );
}

function unauthenticated() {
  return errorEnvelope(401, 'not_authenticated', 'Authentication credentials were not provided.');
}

/** Entity endpoints require the bearer token the login handler issued. */
function requireAuth(request: Request): Response | null {
  const header = request.headers.get('authorization') ?? '';
  if (!header.startsWith('Bearer demo-access-')) return unauthenticated();
  return null;
}

// ---------------------------------------------------------------------------
// List machinery — search / ordering / lookups / pagination like DRF
// ---------------------------------------------------------------------------

function applySearch(rows: DemoProduct[], search: string | null): DemoProduct[] {
  if (!search) return rows;
  const needle = search.toLowerCase();
  return rows.filter(
    (r) => r.name.toLowerCase().includes(needle) || r.sku.toLowerCase().includes(needle),
  );
}

function applyFilters(rows: DemoProduct[], params: URLSearchParams): DemoProduct[] {
  let out = rows;

  const status = params.get('status');
  if (status) out = out.filter((r) => r.status === status);

  const gte = params.get('price__gte');
  if (gte !== null && gte !== '') out = out.filter((r) => r.price >= Number(gte));

  const lte = params.get('price__lte');
  if (lte !== null && lte !== '') out = out.filter((r) => r.price <= Number(lte));

  // Trash semantics from BaseModelViewSet: default hides deleted rows,
  // `is_deleted=true` shows only them, `show_deleted=true` shows both.
  if (params.get('show_deleted') !== 'true') {
    const trashView = params.get('is_deleted') === 'true';
    out = out.filter((r) => r.is_deleted === trashView);
  }

  return out;
}

function applyOrdering(rows: DemoProduct[], ordering: string | null): DemoProduct[] {
  if (!ordering) return rows;
  const desc = ordering.startsWith('-');
  const field = desc ? ordering.slice(1) : ordering;

  return [...rows].sort((a, b) => {
    const av = a[field];
    const bv = b[field];
    const cmp =
      typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av ?? '').localeCompare(String(bv ?? ''));
    return desc ? -cmp : cmp;
  });
}

function paginate(rows: DemoProduct[], params: URLSearchParams) {
  const pageSize = Math.max(1, Number(params.get('page_size') ?? 10));
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const page = Math.min(Math.max(1, Number(params.get('page') ?? 1)), totalPages);
  const start = (page - 1) * pageSize;

  return {
    count: rows.length,
    next: page < totalPages ? `?page=${page + 1}` : null,
    previous: page > 1 ? `?page=${page - 1}` : null,
    page_size: pageSize,
    total_pages: totalPages,
    current_page: page,
    results: rows.slice(start, start + pageSize),
  };
}

function queryRows(request: Request): { params: URLSearchParams; rows: DemoProduct[] } {
  const params = new URL(request.url).searchParams;
  let rows = loadProducts();
  rows = applyFilters(rows, params);
  rows = applySearch(rows, params.get('search'));
  rows = applyOrdering(rows, params.get('ordering'));
  return { params, rows };
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

const AUTH = '*/api/v1/auth';
const ITEMS = '*/api/v1/example/items';

/** A touch of latency so loading states are visible, not subliminal. */
const LATENCY = 250;

export const handlers = [
  // --- Auth ---------------------------------------------------------------

  http.post(`${AUTH}/login/`, async ({ request }) => {
    await delay(LATENCY);
    const body = (await request.json()) as { email?: string; password?: string };

    if (body.email !== DEMO_CREDENTIALS.email) {
      return errorEnvelope(400, 'validation_error', 'Unable to log in with provided credentials.', [
        { field: 'email', code: 'invalid', message: `No account for this address. Demo mode accepts only ${DEMO_CREDENTIALS.email}.` },
      ]);
    }
    if (body.password !== DEMO_CREDENTIALS.password) {
      return errorEnvelope(400, 'validation_error', 'Unable to log in with provided credentials.', [
        { field: 'password', code: 'invalid', message: 'Incorrect password. Demo mode accepts "demo1234".' },
      ]);
    }

    signedIn.set(true);
    return HttpResponse.json({
      access: `demo-access-${Date.now()}`,
      refresh: `demo-refresh-${Date.now()}`,
      user: DEMO_USER,
    });
  }),

  http.post(`${AUTH}/token/refresh/`, async () => {
    await delay(LATENCY);
    if (!signedIn.get()) {
      return errorEnvelope(401, 'authentication_failed', 'No valid refresh token.');
    }
    return HttpResponse.json({ access: `demo-access-${Date.now()}` });
  }),

  http.post(`${AUTH}/logout/`, async () => {
    await delay(LATENCY);
    signedIn.set(false);
    return HttpResponse.json({ detail: 'Successfully logged out.' });
  }),

  http.get(`${AUTH}/user/`, async ({ request }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    return HttpResponse.json(DEMO_USER);
  }),

  http.patch(`${AUTH}/user/`, async ({ request }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const patch = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...DEMO_USER, ...patch });
  }),

  // The remaining auth flows respond with the detail strings dj-rest-auth
  // uses, so every page under app/(auth)/ completes its happy path.
  http.post(`${AUTH}/registration/`, async () => {
    await delay(LATENCY);
    return HttpResponse.json({ detail: 'Verification e-mail sent.' }, { status: 201 });
  }),
  http.post(`${AUTH}/password/reset/`, async () => {
    await delay(LATENCY);
    return HttpResponse.json({ detail: 'Password reset e-mail has been sent.' });
  }),
  http.post(`${AUTH}/password/reset/confirm/`, async () => {
    await delay(LATENCY);
    return HttpResponse.json({ detail: 'Password has been reset with the new password.' });
  }),
  http.post(`${AUTH}/password/change/`, async () => {
    await delay(LATENCY);
    return HttpResponse.json({ detail: 'New password has been saved.' });
  }),
  http.post(`${AUTH}/registration/verify-email/`, async () => {
    await delay(LATENCY);
    return HttpResponse.json({ detail: 'ok' });
  }),
  http.post(`${AUTH}/registration/resend-email/`, async () => {
    await delay(LATENCY);
    return HttpResponse.json({ detail: 'ok' });
  }),

  // --- Example entity ------------------------------------------------------

  http.get(`${ITEMS}/statistics/`, async ({ request }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const all = loadProducts().filter((r) => !r.is_deleted);
    const { rows } = queryRows(request);
    return HttpResponse.json({
      total_count: all.length,
      filtered_count: rows.length,
      active: all.filter((r) => r.status === 'active').length,
      draft: all.filter((r) => r.status === 'draft').length,
      archived: all.filter((r) => r.status === 'archived').length,
    });
  }),

  http.get(`${ITEMS}/bulk_export/`, async ({ request }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const { rows } = queryRows(request);
    const header = 'sku,name,price,status,stock,created_at';
    const lines = rows.map(
      (r) => `${r.sku},"${r.name}",${r.price},${r.status},${r.stock},${r.created_at}`,
    );
    return new HttpResponse([header, ...lines].join('\n'), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="products.csv"',
      },
    });
  }),

  http.get(`${ITEMS}/bulk_import_template/`, async ({ request }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    // Header row only: the template documents the contract, the data is the
    // user's. Column names here must match what bulk_import validates below.
    return new HttpResponse('sku,name,price,status,stock\n', {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="import-template.csv"',
      },
    });
  }),

  /**
   * CSV import with per-row validation, mirroring the Django template's
   * bulk_import: valid rows are created, invalid rows are reported by number
   * with field-keyed messages, and one bad row never aborts the batch.
   */
  http.post(`${ITEMS}/bulk_import/`, async ({ request }) => {
    await delay(LATENCY * 2);
    const denied = requireAuth(request);
    if (denied) return denied;

    const form = await request.formData();
    const file = form.get('file');
    // Not `instanceof File`: under vitest the request is parsed by undici,
    // whose File class is a different realm's than jsdom's global — the
    // instanceof check fails there while being fine in every real browser.
    // "Not a string" is what FormData actually guarantees about a file part.
    if (!file || typeof file === 'string') {
      return errorEnvelope(400, 'validation_error', 'No file provided.', [
        { field: 'file', code: 'required', message: 'Attach a .csv file.' },
      ]);
    }
    if (!file.name.toLowerCase().endsWith('.csv')) {
      // The real backend parses xlsx via openpyxl; the demo keeps its promise
      // honest instead of pretending.
      return errorEnvelope(400, 'validation_error', 'Unsupported file type.', [
        { field: 'file', code: 'invalid', message: 'Demo mode imports .csv only.' },
      ]);
    }

    const { headers, records } = parseCsvRecords(await file.text());
    const required = ['sku', 'name', 'price', 'status', 'stock'];
    const missing = required.filter((column) => !headers.includes(column));
    if (missing.length > 0) {
      return errorEnvelope(400, 'validation_error', 'The file is missing required columns.', [
        { field: 'file', code: 'invalid', message: `Missing column(s): ${missing.join(', ')}.` },
      ]);
    }

    const products = loadProducts();
    const seen = new Set(products.map((r) => r.sku));
    const errors: Array<{ row: number; errors: Record<string, string[]> }> = [];
    let imported = 0;

    records.forEach((record, index) => {
      // Row numbers are 1-based and count the header, matching what the user
      // sees in their spreadsheet.
      const rowNumber = index + 2;
      const rowErrors: Record<string, string[]> = {};

      if (!record.sku) rowErrors.sku = ['This field is required.'];
      else if (seen.has(record.sku)) rowErrors.sku = ['A product with this SKU already exists.'];
      if (!record.name) rowErrors.name = ['This field is required.'];

      const price = Number(record.price);
      if (record.price === '' || Number.isNaN(price) || price < 0) {
        rowErrors.price = ['Enter a non-negative number.'];
      }
      const stock = Number(record.stock);
      if (record.stock === '' || !Number.isInteger(stock) || stock < 0) {
        rowErrors.stock = ['Enter a non-negative whole number.'];
      }
      if (!['draft', 'active', 'archived'].includes(record.status)) {
        rowErrors.status = ['Must be one of: draft, active, archived.'];
      }

      if (Object.keys(rowErrors).length > 0) {
        errors.push({ row: rowNumber, errors: rowErrors });
        return;
      }

      const now = new Date().toISOString();
      products.unshift({
        id: `demo-import-${now}-${rowNumber}`,
        sku: record.sku,
        name: record.name,
        price,
        status: record.status as DemoProduct['status'],
        stock,
        created_at: now,
        updated_at: now,
        is_deleted: false,
        deleted_at: null,
        created_by_email: DEMO_USER.email,
        updated_by_email: DEMO_USER.email,
      });
      seen.add(record.sku);
      imported += 1;
    });

    saveProducts(products);
    return HttpResponse.json({
      imported,
      total_rows: records.length,
      errors,
      message: `${imported} of ${records.length} row(s) imported.`,
    });
  }),

  http.post(`${ITEMS}/bulk_delete/`, async ({ request }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const { ids } = (await request.json()) as { ids: string[] };
    const products = loadProducts();
    const now = new Date().toISOString();
    let count = 0;
    for (const row of products) {
      if (ids.includes(row.id) && !row.is_deleted) {
        row.is_deleted = true;
        row.deleted_at = now;
        count += 1;
      }
    }
    saveProducts(products);
    return HttpResponse.json({ count, message: `${count} item(s) moved to trash.` });
  }),

  http.get(`${ITEMS}/`, async ({ request }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const { params, rows } = queryRows(request);
    return HttpResponse.json(paginate(rows, params));
  }),

  http.post(`${ITEMS}/`, async ({ request }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const body = (await request.json()) as Partial<DemoProduct>;

    const products = loadProducts();
    if (products.some((r) => r.sku === body.sku)) {
      // A uniqueness rule, so the form's field-error rendering has a live
      // demonstration on create as well as on login.
      return errorEnvelope(400, 'validation_error', 'Please correct the errors below.', [
        { field: 'sku', code: 'unique', message: 'A product with this SKU already exists.' },
      ]);
    }

    const now = new Date().toISOString();
    const created: DemoProduct = {
      id: `demo-${now}-${Math.floor(Math.random() * 1e6)}`,
      sku: String(body.sku ?? ''),
      name: String(body.name ?? ''),
      price: Number(body.price ?? 0),
      status: (body.status as DemoProduct['status']) ?? 'draft',
      stock: Number(body.stock ?? 0),
      created_at: now,
      updated_at: now,
      is_deleted: false,
      deleted_at: null,
      created_by_email: DEMO_USER.email,
      updated_by_email: DEMO_USER.email,
    };
    products.unshift(created);
    saveProducts(products);
    return HttpResponse.json(created, { status: 201 });
  }),

  http.post(`${ITEMS}/:id/restore/`, async ({ request, params }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const products = loadProducts();
    const row = products.find((r) => r.id === params.id);
    if (!row) return errorEnvelope(404, 'not_found', 'Not found.');
    row.is_deleted = false;
    row.deleted_at = null;
    saveProducts(products);
    return HttpResponse.json(row);
  }),

  http.delete(`${ITEMS}/:id/hard_delete/`, async ({ request, params }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const products = loadProducts().filter((r) => r.id !== params.id);
    saveProducts(products);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${ITEMS}/:id/`, async ({ request, params }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const row = loadProducts().find((r) => r.id === params.id);
    if (!row) return errorEnvelope(404, 'not_found', 'Not found.');
    return HttpResponse.json(row);
  }),

  http.patch(`${ITEMS}/:id/`, async ({ request, params }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const patch = (await request.json()) as Partial<DemoProduct>;
    const products = loadProducts();
    const row = products.find((r) => r.id === params.id);
    if (!row) return errorEnvelope(404, 'not_found', 'Not found.');
    Object.assign(row, patch, { updated_at: new Date().toISOString() });
    saveProducts(products);
    return HttpResponse.json(row);
  }),

  // Soft delete — the row moves to the trash view, demonstrating restore.
  http.delete(`${ITEMS}/:id/`, async ({ request, params }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const products = loadProducts();
    const row = products.find((r) => r.id === params.id);
    if (!row) return errorEnvelope(404, 'not_found', 'Not found.');
    row.is_deleted = true;
    row.deleted_at = new Date().toISOString();
    saveProducts(products);
    return new HttpResponse(null, { status: 204 });
  }),
];
