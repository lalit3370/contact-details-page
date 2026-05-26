import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LayoutOverrideProvider } from '../layout/LayoutOverrideContext.jsx';
import { ContactDetailsRoute } from '../routes/ContactDetailsRoute.jsx';
import { qk } from '../api/queryKeys.js';

import layoutData from '@/mocks/data/layout.json';
import fieldsData from '@/mocks/data/contactFields.json';
import ownersData from '@/mocks/data/owners.json';
import contact1 from '@/mocks/data/contacts/1.json';
import contact2 from '@/mocks/data/contacts/2.json';
import conversations1 from '@/mocks/data/conversations/1.json';
import notes1 from '@/mocks/data/notes/1.json';

// Seeds the QueryClient with every endpoint the page needs so the test
// renders synchronously without MSW, then snapshots the full DOM.
// Any intentional UI change requires updating the snapshot
// (`npm run test -- -u`); unintentional regressions fail the test.
function buildClient() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  qc.setQueryData(qk.layout, layoutData);
  qc.setQueryData(qk.fields, fieldsData);
  qc.setQueryData(qk.owners, ownersData);
  qc.setQueryData(qk.contacts, {
    contacts: [contact1, contact2].map((c) => ({
      id: c.id,
      displayName: c.header.displayName,
      avatarUrl: c.header.avatarUrl,
    })),
  });
  qc.setQueryData(qk.contact('1'), contact1);
  qc.setQueryData(qk.conversations('1'), conversations1);
  qc.setQueryData(qk.notes('1'), notes1);
  return qc;
}

describe('Full page snapshot — contact 1', () => {
  it('renders ContactDetails, Conversations, and Notes for contact 1', () => {
    const qc = buildClient();
    const { container } = render(
      <QueryClientProvider client={qc}>
        <LayoutOverrideProvider>
          <MemoryRouter initialEntries={['/contact/details/1']}>
            <Routes>
              <Route path="/contact/details/:contactId" element={<ContactDetailsRoute />} />
            </Routes>
          </MemoryRouter>
        </LayoutOverrideProvider>
      </QueryClientProvider>,
    );
    expect(container.innerHTML).toMatchSnapshot();
  });
});
