/**
 * Seed data for demo mode.
 *
 * Deliberately domain-neutral (the same `Product` the worked example in
 * `app/(app)/products/page.tsx` uses) and deliberately varied: every status
 * appears, prices span the filter ranges, timestamps spread over months so
 * relative dates and sorting have something to show, and one record ships
 * soft-deleted so the trash view is not empty.
 */

export interface DemoProduct {
  id: string;
  sku: string;
  name: string;
  price: number;
  status: 'draft' | 'active' | 'archived';
  stock: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at: string | null;
  created_by_email: string;
  updated_by_email: string;
  [key: string]: unknown;
}

/** Days before "now", so the seed never goes stale. */
function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

let seq = 0;
function product(
  overrides: Partial<DemoProduct> & Pick<DemoProduct, 'sku' | 'name' | 'price' | 'status' | 'stock'>,
  ageDays: number,
): DemoProduct {
  seq += 1;
  return {
    id: `demo-${String(seq).padStart(4, '0')}`,
    created_at: daysAgo(ageDays),
    updated_at: daysAgo(Math.max(0, ageDays - 2)),
    is_deleted: false,
    deleted_at: null,
    created_by_email: 'demo@example.com',
    updated_by_email: 'demo@example.com',
    ...overrides,
  };
}

export function seedProducts(): DemoProduct[] {
  return [
    product({ sku: 'CH-0101', name: 'Oak Desk Chair', price: 249.0, status: 'active', stock: 34 }, 210),
    product({ sku: 'CH-0102', name: 'Mesh Task Chair', price: 129.5, status: 'active', stock: 112 }, 180),
    product({ sku: 'DK-0201', name: 'Standing Desk 120cm', price: 499.0, status: 'active', stock: 8 }, 160),
    product({ sku: 'DK-0202', name: 'Corner Desk Walnut', price: 689.0, status: 'draft', stock: 0 }, 140),
    product({ sku: 'LM-0301', name: 'Architect Lamp', price: 79.99, status: 'active', stock: 260 }, 120),
    product({ sku: 'LM-0302', name: 'Clip-on Reading Light', price: 18.75, status: 'archived', stock: 0 }, 400),
    product({ sku: 'SH-0401', name: 'Wall Shelf Set of 3', price: 54.0, status: 'active', stock: 75 }, 95),
    product({ sku: 'SH-0402', name: 'Ladder Bookshelf', price: 189.0, status: 'draft', stock: 12 }, 80),
    product({ sku: 'MT-0501', name: 'Anti-fatigue Mat', price: 42.5, status: 'active', stock: 58 }, 65),
    product({ sku: 'MN-0601', name: 'Monitor Arm Single', price: 99.0, status: 'active', stock: 143 }, 50),
    product({ sku: 'MN-0602', name: 'Monitor Arm Dual', price: 159.0, status: 'active', stock: 61 }, 45),
    product({ sku: 'CB-0701', name: 'Cable Tray 90cm', price: 24.9, status: 'active', stock: 310 }, 30),
    product({ sku: 'CB-0702', name: 'Grommet Kit', price: 9.99, status: 'archived', stock: 4 }, 300),
    product({ sku: 'AC-0801', name: 'Desk Pad Leather', price: 65.0, status: 'draft', stock: 27 }, 21),
    product({ sku: 'AC-0802', name: 'Headphone Hook', price: 14.5, status: 'active', stock: 402 }, 14),
    product({ sku: 'AC-0803', name: 'Laptop Stand Aluminium', price: 58.0, status: 'active', stock: 96 }, 7),
    product(
      { sku: 'LG-0901', name: 'Legacy Footrest', price: 35.0, status: 'archived', stock: 0,
        is_deleted: true, deleted_at: daysAgo(10) },
      365,
    ),
    product({ sku: 'NW-1001', name: 'Acoustic Desk Divider', price: 119.0, status: 'draft', stock: 15 }, 2),
  ];
}

export const DEMO_USER = {
  id: 'demo-user-0001',
  email: 'demo@example.com',
  username: 'demo',
  first_name: 'Demo',
  last_name: 'User',
  is_active: true,
  is_staff: false,
  is_superuser: false,
  date_joined: daysAgo(365),
  last_login: daysAgo(0),
  // Grant the codenames the template's UI checks, so permission-gated
  // elements render. Remove one to see `hasPermission` hide things.
  permissions: ['example.view_item', 'example.add_item', 'example.change_item', 'example.delete_item'],
};

export const DEMO_CREDENTIALS = {
  email: 'demo@example.com',
  password: 'demo1234',
};
