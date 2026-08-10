/**
 * EntityView: section cards, the href link affordance, the actions slot, and
 * the BaseModel timestamps footer.
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EntityView } from './entity-view';
import type { EntityConfig } from '@/lib/entity/types';

interface Order {
  id: string;
  reference: string;
  customer_name: string;
  customer_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

const config: EntityConfig<Order> = {
  name: 'Order',
  detail: [
    { key: 'reference', header: 'Reference', section: 'Order' },
    { key: 'status', header: 'Status', format: 'badge', section: 'Order' },
    {
      key: 'customer_name',
      header: 'Customer',
      section: 'Parties',
      // The related-record affordance: display text stays the name, the
      // link target comes from another field.
      href: (row) => `/customers/${row.customer_id}`,
    },
  ],
};

const order: Order = {
  id: 'o1',
  reference: 'ORD-100',
  customer_name: 'ACME Corp',
  customer_id: '42',
  status: 'open',
  created_at: new Date(Date.now() - 86_400_000).toISOString(),
  updated_at: new Date().toISOString(),
};

describe('EntityView', () => {
  it('renders sections as headed groups with term/definition pairs', () => {
    render(<EntityView config={config} entity={order} />);

    expect(screen.getByRole('heading', { name: 'Order' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Parties' })).toBeInTheDocument();
    expect(screen.getByText('Reference')).toBeInTheDocument();
    expect(screen.getByText('ORD-100')).toBeInTheDocument();
  });

  it('renders href fields as internal links with the value as text', () => {
    render(<EntityView config={config} entity={order} />);

    const link = screen.getByRole('link', { name: 'ACME Corp' });
    expect(link).toHaveAttribute('href', '/customers/42');
    // Internal navigation: no new-tab attributes.
    expect(link).not.toHaveAttribute('target');
  });

  it('renders the actions slot and the timestamps footer', () => {
    render(
      <EntityView
        config={config}
        entity={order}
        actions={<button type="button">Edit</button>}
      />,
    );

    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByText(/Created .* · Updated/)).toBeInTheDocument();
  });
});
