/**
 * EntityForm: section rendering, the wider field-type set, derived-schema
 * validation, and the edit-mode dirty guard.
 *
 * These are behaviour tests, not snapshots — the classes will keep changing;
 * what must not change is that a section heads its fields, a `url` field
 * rejects garbage, and an untouched edit form cannot fire a no-op PATCH.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { EntityForm } from './entity-form';
import type { EntityConfig } from '@/lib/entity/types';

interface Widget {
  id: string;
  sku: string;
  description?: string;
  website?: string;
  [key: string]: unknown;
}

const config: EntityConfig<Widget> = {
  name: 'Widget',
  fields: [
    { key: 'sku', label: 'SKU', required: true, createOnly: true, section: 'Identity' },
    { key: 'description', label: 'Description', type: 'textarea', rows: 3, section: 'Details' },
    { key: 'website', label: 'Website', type: 'url', section: 'Details' },
  ],
};

describe('EntityForm', () => {
  it('groups fields under their section headings', () => {
    render(<EntityForm config={config} onSubmit={vi.fn(async () => {})} />);

    expect(screen.getByText('Identity')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
    // fieldset/legend semantics: the section groups its controls.
    expect(screen.getByText('Identity').closest('fieldset')).toContainElement(
      screen.getByLabelText(/SKU/),
    );
  });

  it('renders textarea and url field types', () => {
    render(<EntityForm config={config} onSubmit={vi.fn(async () => {})} />);

    const description = screen.getByLabelText('Description');
    expect(description.tagName).toBe('TEXTAREA');
    expect(description).toHaveAttribute('rows', '3');

    expect(screen.getByLabelText('Website')).toHaveAttribute('type', 'url');
  });

  it('derives required and url rules from the config when no schema is passed', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async () => {});
    render(<EntityForm config={config} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Website'), 'not-a-url');
    await user.click(screen.getByRole('button', { name: 'Create Widget' }));

    expect(await screen.findByText('SKU is required.')).toBeInTheDocument();
    expect(screen.getByText(/must be a full URL/)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('disables submit on an untouched edit form, enables it on change', async () => {
    const user = userEvent.setup();
    render(
      <EntityForm
        config={config}
        initial={{ id: 'w1', sku: 'W-1', description: 'old', website: '' }}
        onSubmit={vi.fn(async () => {})}
      />,
    );

    const submit = screen.getByRole('button', { name: 'Save changes' });
    expect(submit).toBeDisabled();

    // createOnly renders disabled in edit mode — the value shows, the field
    // does not accept input.
    expect(screen.getByLabelText(/SKU/)).toBeDisabled();

    await user.type(screen.getByLabelText('Description'), ' updated');
    expect(submit).toBeEnabled();
  });
});
