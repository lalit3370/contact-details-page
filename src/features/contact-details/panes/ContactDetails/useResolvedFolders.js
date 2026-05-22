import { useMemo } from 'react';
import { useLayout, useFields, useContact } from '../../api/queries.js';

export function useResolvedFolders(contactId) {
  const { data: layout, isLoading: layoutLoading } = useLayout();
  const { data: fieldsData, isLoading: fieldsLoading } = useFields();
  const { data: contact, isLoading: contactLoading } = useContact(contactId);

  const isLoading = layoutLoading || fieldsLoading || contactLoading;

  const folders = useMemo(() => {
    if (!layout || !fieldsData || !contact) return null;
    const pane = layout.panes?.find((p) => p.type === 'contactDetails');
    if (!pane) return [];

    return (pane.folders ?? []).map((folder) => ({
      id: folder.id,
      label: folder.label,
      defaultOpen: folder.defaultOpen ?? true,
      showAdd: folder.showAdd ?? false,
      rows: (folder.fieldIds ?? [])
        .map((id) => {
          const def = fieldsData.fields?.[id];
          if (!def) {
            if (import.meta.env.DEV) {
              console.warn(
                `[useResolvedFolders] folder "${folder.id}" references unknown field id "${id}"`,
              );
            }
            return null;
          }
          return { id, field: def, value: contact.fields?.[id] };
        })
        .filter(Boolean),
    }));
  }, [layout, fieldsData, contact]);

  return { folders, contact, isLoading };
}
