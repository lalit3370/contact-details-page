import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { LayoutOverrideProvider } from '../layout/LayoutOverrideContext.jsx';
import { ContactDetails } from '../panes/ContactDetails/ContactDetails.jsx';
import { qk } from '../api/queryKeys.js';
import { PaneType } from '../layout/paneTypes.js';

function buildWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  qc.setQueryData(qk.layout, {
    panes: [
      {
        id: 'cd',
        type: PaneType.ContactDetails,
        folders: [
          {
            id: 'contact',
            label: 'Contact',
            fieldIds: ['firstName', 'email'],
            defaultOpen: true,
            showAdd: true,
          },
        ],
      },
    ],
  });
  qc.setQueryData(qk.fields, {
    fields: {
      firstName: { label: 'First Name', type: 'string' },
      email: { label: 'Email', type: 'email' },
    },
  });
  qc.setQueryData(qk.contact('c1'), {
    id: 'c1',
    header: {
      avatarUrl: null,
      displayName: 'Olivia John',
      owner: { id: 'd', name: 'Devon Lane' },
      followers: [],
      tags: ['VIP'],
      tagsOverflow: 0,
      dnd: false,
    },
    fields: { firstName: 'Olivia', email: 'olivia@example.com' },
  });
  qc.setQueryData(qk.contacts, {
    contacts: [
      { id: 'c1', displayName: 'Olivia John', avatarUrl: null },
      { id: 'c2', displayName: 'Marcus Chen', avatarUrl: null },
    ],
  });
  return qc;
}

describe('ContactDetails', () => {
  it('renders header, folder, and field rows from cache', () => {
    const qc = buildWrapper();
    render(
      <BrowserRouter>
        <QueryClientProvider client={qc}>
          <LayoutOverrideProvider>
            <ContactDetails contactId="c1" />
          </LayoutOverrideProvider>
        </QueryClientProvider>
      </BrowserRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Contact Details' })).toBeInTheDocument();
    expect(screen.getByText('Olivia John')).toBeInTheDocument();
    expect(screen.getByText('Devon Lane')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('Olivia')).toBeInTheDocument();
    expect(screen.getByText('olivia@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search Fields and Folders')).toBeInTheDocument();
    expect(screen.getByText('1 of 2')).toBeInTheDocument();
  });
});
