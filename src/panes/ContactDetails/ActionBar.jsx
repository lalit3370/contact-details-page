import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import styles from './ContactDetails.module.css';

export function ActionBar({ dnd, onToggleDnd }) {
  return (
    <div className={styles.actionBar} role="tablist" aria-label="Contact view options">
      <button
        type="button"
        className={`${styles.actionTab} ${styles.actionTabActive}`}
        role="tab"
        aria-selected="true"
      >
        All Fields
      </button>
      <button
        type="button"
        className={styles.actionTab}
        onClick={onToggleDnd}
        aria-pressed={Boolean(dnd)}
      >
        DND
      </button>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className={styles.actionTab}>Actions</DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className={styles.actionMenu} sideOffset={6} align="end">
            <DropdownMenu.Item className={styles.actionMenuItem}>Send email</DropdownMenu.Item>
            <DropdownMenu.Item className={styles.actionMenuItem}>Log a call</DropdownMenu.Item>
            <DropdownMenu.Item className={styles.actionMenuItem}>Add task</DropdownMenu.Item>
            <DropdownMenu.Separator className={styles.actionMenuSep} />
            <DropdownMenu.Item className={styles.actionMenuItemDanger}>Delete</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
