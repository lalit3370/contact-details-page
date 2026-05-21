import { useState } from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';
import styles from './ContactDetails.module.css';

export function Folder({ folder, children }) {
  const [open, setOpen] = useState(folder.defaultOpen ?? true);

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen} className={styles.folder}>
      <Collapsible.Trigger className={styles.folderTrigger} aria-expanded={open}>
        <span className={styles.folderLabel}>{folder.label}</span>
        {folder.showAdd ? (
          <span
            className={styles.folderAdd}
            onClick={(e) => e.stopPropagation()}
            aria-hidden="true"
          >
            + Add
          </span>
        ) : null}
        <svg
          className={styles.folderChevron}
          data-open={open}
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 10L8 6L12 10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Collapsible.Trigger>
      <Collapsible.Content className={styles.folderBody}>{children}</Collapsible.Content>
    </Collapsible.Root>
  );
}
