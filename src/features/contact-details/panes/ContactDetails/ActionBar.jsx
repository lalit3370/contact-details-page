import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { notImplemented } from '@/shared/utils.js';
import styles from './ContactDetails.module.css';

// views:   [{ id, label, indicator? }, ...] — indicator shows a dot on the tab
// actions: [{ id, label, variant? }, ...] — variant "danger" gets red styling
export function ActionBar({ views, actions, activeViewId, onChangeView }) {
  return (
    <div className={styles.actionBarWrap}>
      <div className={styles.actionBar} role="toolbar" aria-label="Contact view options">
        {views.map((view) => {
          const isActive = activeViewId === view.id;
          return (
            <button
              key={view.id}
              type="button"
              className={`${styles.actionTab} ${isActive ? styles.actionTabActive : ''}`}
              aria-pressed={isActive}
              onClick={() => onChangeView(view.id)}
            >
              {view.label}
              {view.indicator ? <span className={styles.actionTabDot} aria-hidden="true" /> : null}
            </button>
          );
        })}
        {actions.length > 0 ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger className={styles.actionTab}>Actions</DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className={styles.actionMenu} sideOffset={6} align="end">
                {actions.map((action, i) => {
                  const isDanger = action.variant === 'danger';
                  const prevDanger = i > 0 && actions[i - 1]?.variant === 'danger';
                  // Auto-insert a separator before the first danger item so the
                  // destructive actions sit visually apart from the others.
                  const needsSep = isDanger && !prevDanger && i > 0;
                  return (
                    <span key={action.id}>
                      {needsSep ? (
                        <DropdownMenu.Separator className={styles.actionMenuSep} />
                      ) : null}
                      <DropdownMenu.Item
                        className={isDanger ? styles.actionMenuItemDanger : styles.actionMenuItem}
                        onSelect={notImplemented(action.label)}
                      >
                        {action.label}
                      </DropdownMenu.Item>
                    </span>
                  );
                })}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        ) : null}
      </div>
    </div>
  );
}
