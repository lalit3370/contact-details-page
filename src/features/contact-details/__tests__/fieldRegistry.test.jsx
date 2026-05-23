import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fieldRegistry } from '../panes/ContactDetails/fieldRegistry.js';
import { FieldRow } from '../panes/ContactDetails/FieldRow.jsx';
import { qk } from '../api/queryKeys.js';

const FIXTURES = {
  string: { label: 'String', type: 'string', value: 'hello' },
  email: { label: 'Email', type: 'email', value: 'a@b.co' },
  url: { label: 'URL', type: 'url', value: 'https://example.com' },
  textarea: { label: 'Textarea', type: 'textarea', value: 'a\nb', multiline: true },
  phone: { label: 'Phone', type: 'phone', value: '555' },
  number: { label: 'Number', type: 'number', value: 42 },
  currency: { label: 'Currency', type: 'currency', value: 1000, currency: 'USD' },
  date: { label: 'Date', type: 'date', value: '2026-05-21' },
  radio: { label: 'Radio', type: 'radio', value: 'A', options: ['A', 'B'] },
  'multi-select': { label: 'Multi', type: 'multi-select', value: ['A'], options: ['A', 'B'] },
  boolean: { label: 'Bool', type: 'boolean', value: true },
  tags: { label: 'Tags', type: 'tags', value: ['x', 'y'] },
};

function renderWithClient(ui) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  qc.setQueryData(qk.contact('c1'), { id: 'c1', header: {}, fields: {} });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe('fieldRegistry', () => {
  it('has an entry for every supported type id', () => {
    const expected = [
      'string',
      'email',
      'url',
      'textarea',
      'phone',
      'number',
      'currency',
      'date',
      'radio',
      'multi-select',
      'boolean',
      'tags',
    ];
    for (const id of expected) {
      expect(fieldRegistry[id]).toBeTruthy();
    }
  });

  for (const [typeId, fixture] of Object.entries(FIXTURES)) {
    it(`renders type "${typeId}" without crashing and shows its label`, () => {
      const { unmount } = renderWithClient(
        <FieldRow
          field={fixture}
          value={fixture.value}
          fieldId={`f-${typeId}`}
          contactId="c1"
          contact={{ id: 'c1', header: {}, fields: {} }}
        />,
      );
      expect(screen.getByText(fixture.label)).toBeInTheDocument();
      unmount();
    });
  }

  it('renders FallbackField for unknown field type and warns in dev', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderWithClient(
      <FieldRow
        field={{ label: 'Bogus', type: 'bogus-type' }}
        value={'xyz'}
        fieldId="f-bogus"
        contactId="c1"
        contact={{ id: 'c1', header: {}, fields: {} }}
      />,
    );
    expect(screen.getByText('Bogus')).toBeInTheDocument();
    expect(screen.getByText('xyz')).toBeInTheDocument();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
