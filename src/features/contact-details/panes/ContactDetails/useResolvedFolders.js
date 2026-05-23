import { useMemo } from 'react';
import { useLayout, useFields, useContact } from '../../api/queries.js';
import { PaneType } from '../../layout/paneTypes.js';

export function useResolvedFolders(contactId) {
  const { data: layout, isLoading: layoutLoading } = useLayout();
  const { data: fieldsData, isLoading: fieldsLoading } = useFields();
  const {
    data: contact,
    isLoading: contactLoading,
    isError: contactError,
    refetch: refetchContact,
  } = useContact(contactId);

  const isLoading = layoutLoading || fieldsLoading || contactLoading;

  const pane = useMemo(
    () => layout?.panes?.find((p) => p.type === PaneType.ContactDetails) ?? null,
    [layout],
  );

  const folders = useMemo(() => {
    if (!fieldsData || !contact) return null;
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
  }, [pane, fieldsData, contact]);

  return { folders, contact, pane, isLoading, isError: contactError, refetch: refetchContact };
}
