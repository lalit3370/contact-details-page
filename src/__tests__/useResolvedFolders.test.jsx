import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LayoutOverrideProvider } from '../layout/LayoutOverrideContext.jsx';
import { useResolvedFolders } from '../panes/ContactDetails/useResolvedFolders.js';

function buildWrapper(seed) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  if (seed.layout) qc.setQueryData(['layout'], seed.layout);
  if (seed.fields) qc.setQueryData(['fields'], seed.fields);
  if (seed.contact) qc.setQueryData(['contact', 'c1'], seed.contact);
  function Wrapper({ children }) {
    return (
      <QueryClientProvider client={qc}>
        <LayoutOverrideProvider>{children}</LayoutOverrideProvider>
      </QueryClientProvider>
    );
  }
  return Wrapper;
}

describe('useResolvedFolders', () => {
  it('joins layout × fields × data into render-ready rows', () => {
    const wrapper = buildWrapper({
      layout: {
        panes: [
          {
            id: 'cd',
            type: 'contactDetails',
            folders: [
              { id: 'main', label: 'Main', fieldIds: ['firstName', 'phone'], defaultOpen: true },
            ],
          },
        ],
      },
      fields: {
        fields: {
          firstName: { label: 'First Name', type: 'string' },
          phone: { label: 'Phone', type: 'phone' },
        },
      },
      contact: { id: 'c1', header: {}, fields: { firstName: 'Olivia', phone: '555-1234' } },
    });

    const { result } = renderHook(() => useResolvedFolders('c1'), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.folders).toHaveLength(1);
    const folder = result.current.folders[0];
    expect(folder.label).toBe('Main');
    expect(folder.rows).toHaveLength(2);
    expect(folder.rows[0]).toMatchObject({ id: 'firstName', value: 'Olivia' });
    expect(folder.rows[0].field.label).toBe('First Name');
    expect(folder.rows[1]).toMatchObject({ id: 'phone', value: '555-1234' });
  });

  it('skips and warns when a folder references an unknown field id', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const wrapper = buildWrapper({
      layout: {
        panes: [
          {
            id: 'cd',
            type: 'contactDetails',
            folders: [
              { id: 'main', label: 'Main', fieldIds: ['firstName', 'bogus'], defaultOpen: true },
            ],
          },
        ],
      },
      fields: { fields: { firstName: { label: 'First', type: 'string' } } },
      contact: { id: 'c1', header: {}, fields: { firstName: 'X' } },
    });

    const { result } = renderHook(() => useResolvedFolders('c1'), { wrapper });
    expect(result.current.folders[0].rows).toHaveLength(1);
    expect(result.current.folders[0].rows[0].id).toBe('firstName');
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('returns [] when layout has no contactDetails pane', () => {
    const wrapper = buildWrapper({
      layout: { panes: [{ id: 'n', type: 'notes' }] },
      fields: { fields: {} },
      contact: { id: 'c1', header: {}, fields: {} },
    });

    const { result } = renderHook(() => useResolvedFolders('c1'), { wrapper });
    expect(result.current.folders).toEqual([]);
  });
});
