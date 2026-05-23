import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ContactHeader } from './ContactHeader.jsx';
import { ActionBar } from './ActionBar.jsx';
import { SearchFields } from './SearchFields.jsx';
import { Folder } from './Folder.jsx';
import { FieldRow } from './FieldRow.jsx';
import { DndPanel } from './DndPanel.jsx';
import { useResolvedFolders } from './useResolvedFolders.js';
import { qk } from '../../api/queryKeys.js';
import { Skeleton } from '@/shared/primitives.jsx';
import styles from './ContactDetails.module.css';

export function ContactDetails({ contactId }) {
  const { folders, contact, isLoading, isError, refetch } = useResolvedFolders(contactId);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('fields');
  const qc = useQueryClient();

  const visibleFolders = useMemo(() => {
    if (!folders) return null;
    const q = search.trim().toLowerCase();
    if (!q) return folders;
    return folders
      .map((f) => ({
        ...f,
        rows: f.rows.filter(
          (r) =>
            r.field.label.toLowerCase().includes(q) ||
            (typeof r.value === 'string' && r.value.toLowerCase().includes(q)),
        ),
      }))
      .filter((f) => f.rows.length > 0 || f.label.toLowerCase().includes(q));
  }, [folders, search]);

  const toggleDnd = () => {
    if (!contact) return;
    qc.setQueryData(qk.contact(contactId), (prev) =>
      prev ? { ...prev, header: { ...prev.header, dnd: !prev.header.dnd } } : prev,
    );
  };

  const toggleDndChannel = (channelId, value) => {
    qc.setQueryData(qk.contact(contactId), (prev) =>
      prev
        ? {
            ...prev,
            header: {
              ...prev.header,
              dndChannels: { ...(prev.header.dndChannels ?? {}), [channelId]: value },
            },
          }
        : prev,
    );
  };

  if (isError) {
    return (
      <section className={styles.pane}>
        <div className={styles.errorState} role="alert">
          <p>Couldn’t load contact.</p>
          <button type="button" className={styles.retryBtn} onClick={() => refetch()}>
            Try again
          </button>
        </div>
      </section>
    );
  }

  if (isLoading || !contact || !visibleFolders) {
    return (
      <section className={styles.pane} aria-busy="true">
        <div className={styles.skeletonStack}>
          <Skeleton height={48} radius={6} />
          <Skeleton height={24} />
          <Skeleton height={120} radius={6} />
          <Skeleton height={120} radius={6} />
        </div>
      </section>
    );
  }

  return (
    <section className={styles.pane} aria-label="Contact details">
      <ContactHeader contactId={contactId} contact={contact} />
      <ActionBar view={view} onChangeView={setView} dndOn={contact.header.dnd} />
      {view === 'fields' ? (
        <>
          <SearchFields value={search} onChange={setSearch} />
          <div className={styles.folders}>
            {visibleFolders.length === 0 ? (
              <p className={styles.empty}>No matching fields or folders.</p>
            ) : (
              visibleFolders.map((folder) => (
                <Folder key={folder.id} folder={folder}>
                  {folder.rows.map((row) => (
                    <FieldRow
                      key={row.id}
                      field={row.field}
                      value={row.value}
                      fieldId={row.id}
                      contactId={contactId}
                      contact={contact}
                    />
                  ))}
                </Folder>
              ))
            )}
          </div>
        </>
      ) : (
        <DndPanel
          dndOn={contact.header.dnd}
          onToggleDnd={toggleDnd}
          channels={contact.header.dndChannels}
          onToggleChannel={toggleDndChannel}
        />
      )}
    </section>
  );
}
