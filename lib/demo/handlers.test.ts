/**
 * The demo backend is only worth shipping if it honours the same contracts
 * the real one does — otherwise it teaches the wrong lessons. These tests
 * run the browser handlers through msw/node and assert the envelope,
 * pagination, filter, and trash semantics the UI depends on.
 */

import { File as NodeFile } from 'node:buffer';

import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { handlers } from './handlers';
import { DEMO_CREDENTIALS } from './data';

// jsdom's File shadows Node's, and undici's multipart parser constructs file
// parts with `globalThis.File` then type-checks them against its own realm —
// so any multipart request in a jsdom test 500s. Restoring Node's File for
// this file (each vitest file has its own global scope) fixes the parser;
// nothing here needs jsdom's File.
Object.defineProperty(globalThis, 'File', { value: NodeFile, configurable: true });

const server = setupServer(...handlers);

const BASE = 'http://demo.test/api/v1';

function authed(init: RequestInit = {}): RequestInit {
  return {
    ...init,
    headers: { ...init.headers, Authorization: 'Bearer demo-access-1' },
  };
}

async function post(path: string, body: unknown, init: RequestInit = {}) {
  return fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...init.headers },
    body: JSON.stringify(body),
    ...init,
  });
}

/**
 * Hand-built multipart body. jsdom's File/FormData and undici's fetch live
 * in different realms — a jsdom File fails undici's multipart parser — so the
 * test writes the wire format directly, which is also a more honest test of
 * what a browser actually sends.
 */
function uploadCsv(path: string, filename: string, content: string) {
  const boundary = '----vitestBoundary';
  const body =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
    'Content-Type: text/csv\r\n\r\n' +
    `${content}\r\n--${boundary}--\r\n`;

  return fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      Authorization: 'Bearer demo-access-1',
    },
    body,
  });
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  // Handlers persist to sessionStorage; each test starts from a fresh seed.
  sessionStorage.clear();
});

describe('demo auth', () => {
  it('rejects a wrong password with the backend error envelope', async () => {
    const res = await post('/auth/login/', {
      email: DEMO_CREDENTIALS.email,
      password: 'wrong',
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.type).toBe('validation_error');
    expect(body.error.detail[0].field).toBe('password');
  });

  it('issues tokens and a user for the demo credentials', async () => {
    const res = await post('/auth/login/', DEMO_CREDENTIALS);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.access).toMatch(/^demo-access-/);
    expect(body.user.email).toBe(DEMO_CREDENTIALS.email);
  });

  it('refuses refresh before login and allows it after', async () => {
    const before = await post('/auth/token/refresh/', {});
    expect(before.status).toBe(401);

    await post('/auth/login/', DEMO_CREDENTIALS);
    const after = await post('/auth/token/refresh/', {});
    expect(after.status).toBe(200);
  });
});

describe('demo entity list', () => {
  it('requires a bearer token', async () => {
    const res = await fetch(`${BASE}/example/items/`);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.type).toBe('not_authenticated');
  });

  it('returns the StandardResultsSetPagination shape', async () => {
    const res = await fetch(`${BASE}/example/items/?page_size=5`, authed());
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body).toMatchObject({ current_page: 1, page_size: 5 });
    expect(body.results).toHaveLength(5);
    expect(body.total_pages).toBe(Math.ceil(body.count / 5));
    expect(body.next).not.toBeNull();
    expect(body.previous).toBeNull();
  });

  it('applies Django-style lookups, search, and ordering', async () => {
    const res = await fetch(
      `${BASE}/example/items/?status=active&price__gte=50&price__lte=200&ordering=-price&page_size=50`,
      authed(),
    );
    const body = await res.json();

    expect(body.count).toBeGreaterThan(0);
    for (const row of body.results) {
      expect(row.status).toBe('active');
      expect(row.price).toBeGreaterThanOrEqual(50);
      expect(row.price).toBeLessThanOrEqual(200);
    }
    const prices = body.results.map((r: { price: number }) => r.price);
    expect(prices).toEqual([...prices].sort((a, b) => b - a));

    const search = await fetch(`${BASE}/example/items/?search=monitor&page_size=50`, authed());
    const found = await search.json();
    expect(found.count).toBeGreaterThan(0);
    for (const row of found.results) {
      expect(`${row.name} ${row.sku}`.toLowerCase()).toContain('monitor');
    }
  });

  it('soft-deletes into the trash view and restores from it', async () => {
    const list = await fetch(`${BASE}/example/items/?page_size=1`, authed()).then((r) => r.json());
    const target = list.results[0];

    const del = await fetch(`${BASE}/example/items/${target.id}/`, authed({ method: 'DELETE' }));
    expect(del.status).toBe(204);

    // Gone from the live list…
    const live = await fetch(`${BASE}/example/items/?page_size=50`, authed()).then((r) => r.json());
    expect(live.results.map((r: { id: string }) => r.id)).not.toContain(target.id);

    // …present in the trash…
    const trash = await fetch(`${BASE}/example/items/?is_deleted=true&page_size=50`, authed()).then(
      (r) => r.json(),
    );
    expect(trash.results.map((r: { id: string }) => r.id)).toContain(target.id);

    // …and back after restore.
    const restore = await post(`/example/items/${target.id}/restore/`, {}, authed());
    expect(restore.status).toBe(200);
    const after = await fetch(`${BASE}/example/items/?page_size=50`, authed()).then((r) => r.json());
    expect(after.results.map((r: { id: string }) => r.id)).toContain(target.id);
  });

  it('serves an import template whose header matches what import validates', async () => {
    const res = await fetch(`${BASE}/example/items/bulk_import_template/`, authed());
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/csv');
    expect((await res.text()).trim()).toBe('sku,name,price,status,stock');
  });

  it('imports valid CSV rows and reports invalid ones by row number', async () => {
    const csv = [
      'sku,name,price,status,stock',
      'NEW-001,Imported Desk,199.5,active,10', // valid
      ',Missing Sku,10,active,1', // row 3: sku required
      'NEW-002,Bad Numbers,abc,active,1.5', // row 4: price NaN, stock not int
      'NEW-003,Bad Status,10,unknown,1', // row 5: status enum
    ].join('\n');

    const res = await uploadCsv('/example/items/bulk_import/', 'products.csv', csv);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.imported).toBe(1);
    expect(body.total_rows).toBe(4);
    expect(body.errors.map((e: { row: number }) => e.row)).toEqual([3, 4, 5]);
    expect(body.errors[1].errors).toHaveProperty('price');
    expect(body.errors[1].errors).toHaveProperty('stock');

    // The valid row is really in the store.
    const search = await fetch(`${BASE}/example/items/?search=NEW-001`, authed());
    expect((await search.json()).count).toBe(1);
  });

  it('rejects a file with missing columns as a file-level error', async () => {
    const res = await uploadCsv('/example/items/bulk_import/', 'partial.csv', 'sku,name\nA,B');

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.detail[0].message).toContain('price');
  });

  it('rejects a duplicate SKU with a field error, like the real backend', async () => {
    const list = await fetch(`${BASE}/example/items/?page_size=1`, authed()).then((r) => r.json());
    const existing = list.results[0];

    const res = await post(
      '/example/items/',
      { sku: existing.sku, name: 'Copy', price: 1, stock: 1, status: 'draft' },
      authed(),
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.detail[0]).toMatchObject({ field: 'sku', code: 'unique' });
  });
});
