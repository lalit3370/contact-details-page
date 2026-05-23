import { useMemo, useState } from 'react';
import { SearchFields } from '../SearchFields.jsx';
import { Folder } from '../Folder.jsx';
import { FieldRow } from '../FieldRow.jsx';
import { filterFolders } from '../filterFolders.js';
import styles from '../ContactDetails.module.css';

export function FoldersView({ contactId, contact, folders }) {
  const [search, setSearch] = useState('');
  const visibleFolders = useMemo(() => filterFolders(folders, search), [folders, search]);

  if (!visibleFolders) return null;

  return (
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
  );
}
