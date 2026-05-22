import { useState } from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';
import styles from './ContactDetails.module.css';

export function Folder({ folder, children }) {
  const [open, setOpen] = useState(folder.defaultOpen ?? true);

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen} className={styles.folder}>
      <div className={styles.folderHeader}>
        <Collapsible.Trigger className={styles.folderTrigger} aria-expanded={open}>
          <span className={styles.folderLabel}>{folder.label}</span>
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
        {folder.showAdd ? (
          <button
            type="button"
            className={styles.folderAdd}
            onClick={() =>
              alert(`Add to "${folder.label}"\n\nThis action is not wired up in the demo.`)
            }
          >
            + Add
          </button>
        ) : null}
      </div>
      <Collapsible.Content className={styles.folderBody}>{children}</Collapsible.Content>
    </Collapsible.Root>
  );
}
