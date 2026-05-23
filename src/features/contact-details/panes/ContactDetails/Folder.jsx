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
        {/* Label trigger fills the row; + Add sits between label and chevron;
            chevron is its own trigger so both surfaces toggle the section. */}
        <Collapsible.Trigger className={styles.folderTrigger} aria-expanded={open}>
          <span className={styles.folderLabel}>{folder.label}</span>
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
        <Collapsible.Trigger
          className={styles.folderChevronTrigger}
          aria-label={open ? 'Collapse' : 'Expand'}
        >
          <ChevronUpIcon className={styles.folderChevron} data-open={open} />
        </Collapsible.Trigger>
      </div>
      <Collapsible.Content className={styles.folderBody}>{children}</Collapsible.Content>
    </Collapsible.Root>
  );
}
