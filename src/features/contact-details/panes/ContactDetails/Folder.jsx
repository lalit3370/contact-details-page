import { useState } from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';
import { notImplemented } from '@/shared/utils.js';
import { ChevronUpIcon } from '@/shared/Icons.jsx';
import styles from './ContactDetails.module.css';

export function Folder({ folder, children }) {
  const [open, setOpen] = useState(folder.defaultOpen ?? true);

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen} className={styles.folder}>
      <div className={styles.folderHeader}>
        <Collapsible.Trigger className={styles.folderTrigger} aria-expanded={open}>
          <span className={styles.folderLabel}>{folder.label}</span>
          <ChevronUpIcon className={styles.folderChevron} data-open={open} />
        </Collapsible.Trigger>
        {folder.showAdd ? (
          <button
            type="button"
            className={styles.folderAdd}
            onClick={notImplemented(`Add to "${folder.label}"`)}
          >
            + Add
          </button>
        ) : null}
      </div>
      <Collapsible.Content className={styles.folderBody}>{children}</Collapsible.Content>
    </Collapsible.Root>
  );
}
