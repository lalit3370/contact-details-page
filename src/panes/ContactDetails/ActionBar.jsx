import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import styles from './ContactDetails.module.css';

const notImplemented = (label) => () =>
  alert(`${label}\n\nThis action is not wired up in the demo.`);

export function ActionBar({ dnd, onToggleDnd }) {
  return (
    <div className={styles.actionBarWrap}>
      <div className={styles.actionBar} role="toolbar" aria-label="Contact view options">
        <button
          type="button"
          className={`${styles.actionTab} ${styles.actionTabActive}`}
          aria-current="page"
        >
          All Fields
        </button>
        <button
          type="button"
          className={`${styles.actionTab} ${dnd ? styles.actionTabActive : ''}`}
          onClick={onToggleDnd}
          aria-pressed={Boolean(dnd)}
        >
          DND
        </button>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className={styles.actionTab}>Actions</DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className={styles.actionMenu} sideOffset={6} align="end">
              <DropdownMenu.Item
                className={styles.actionMenuItem}
                onSelect={notImplemented('Send email')}
              >
                Send email
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className={styles.actionMenuItem}
                onSelect={notImplemented('Log a call')}
              >
                Log a call
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className={styles.actionMenuItem}
                onSelect={notImplemented('Add task')}
              >
                Add task
              </DropdownMenu.Item>
              <DropdownMenu.Separator className={styles.actionMenuSep} />
              <DropdownMenu.Item
                className={styles.actionMenuItemDanger}
                onSelect={notImplemented('Delete contact')}
              >
                Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </div>
  );
}
