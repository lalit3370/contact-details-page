import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useContacts } from '../../api/queries.js';
import { Avatar, Chip, IconButton } from '../../shared/primitives.jsx';
import styles from './ContactDetails.module.css';

export function ContactHeader({ contactId, contact }) {
  const { data: contactsData } = useContacts();
  const navigate = useNavigate();

  const { index, total, prevId, nextId } = useMemo(() => {
    const list = contactsData?.contacts ?? [];
    const i = list.findIndex((c) => c.id === contactId);
    return {
      index: i,
      total: list.length,
      prevId: i > 0 ? list[i - 1].id : null,
      nextId: i >= 0 && i < list.length - 1 ? list[i + 1].id : null,
    };
  }, [contactsData, contactId]);

  if (!contact) return null;
  const { header } = contact;

  return (
    <div className={styles.header}>
      <div className={styles.headerTopRow}>
        <button
          type="button"
          className={styles.headerBackBtn}
          aria-label="Back"
          onClick={() => navigate(-1)}
        >
          <ChevronLeftIcon />
        </button>
        <h2 className={styles.headerTitle}>Contact Details</h2>
        <div className={styles.headerCounter}>
          {index >= 0 ? `${index + 1} of ${total}` : ''}
          <IconButton
            label="Previous contact"
            onClick={() => prevId && navigate(`/contact/details/${prevId}`)}
            disabled={!prevId}
            className={styles.headerNavBtn}
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            label="Next contact"
            onClick={() => nextId && navigate(`/contact/details/${nextId}`)}
            disabled={!nextId}
            className={styles.headerNavBtn}
          >
            <ChevronRightIcon />
          </IconButton>
        </div>
      </div>

      <div className={styles.headerCard}>
        <div className={styles.headerProfile}>
          <Avatar url={header.avatarUrl} name={header.displayName} size={36} />
          <div className={styles.headerName}>{header.displayName}</div>
          <IconButton label="Call" className={styles.headerCallBtn}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 3.5C3 2.67 3.67 2 4.5 2H5.5L6.5 4.5L5 5.5C5.5 7 7 8.5 8.5 9L9.5 7.5L12 8.5V9.5C12 10.33 11.33 11 10.5 11C6.36 11 3 7.64 3 3.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </IconButton>
        </div>

        <div className={styles.headerMetaGrid}>
          <div className={styles.headerMetaCell}>
            <span className={styles.headerMetaLabel}>Owner</span>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger className={styles.headerOwnerTrigger}>
                <Avatar name={header.owner?.name} size={20} />
                <span className={styles.headerOwnerName}>{header.owner?.name ?? '—'}</span>
                <ChevronDownIcon />
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className={styles.actionMenu} sideOffset={6}>
                  <DropdownMenu.Item className={styles.actionMenuItem}>
                    Devon Lane
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className={styles.actionMenuItem}>
                    Olivia Perry
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className={styles.actionMenuItem}>
                    Brooklyn Simmons
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>

          <div className={styles.headerMetaCell}>
            <span className={styles.headerMetaLabel}>Followers</span>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger className={styles.headerFollowersTrigger}>
                <span className={styles.headerFollowerStack}>
                  {(header.followers ?? []).slice(0, 3).map((f, i) => (
                    <span key={f.id} style={{ marginLeft: i === 0 ? 0 : -8, zIndex: 3 - i }}>
                      <Avatar name={f.name} size={20} />
                    </span>
                  ))}
                </span>
                <ChevronDownIcon />
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className={styles.actionMenu} sideOffset={6}>
                  {(header.followers ?? []).map((f) => (
                    <DropdownMenu.Item key={f.id} className={styles.actionMenuItem}>
                      {f.name}
                    </DropdownMenu.Item>
                  ))}
                  {(header.followers ?? []).length === 0 ? (
                    <div className={styles.actionMenuEmpty}>No followers yet</div>
                  ) : null}
                  <DropdownMenu.Separator className={styles.actionMenuSep} />
                  <DropdownMenu.Item className={styles.actionMenuItem}>
                    + Add follower
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>

        <div className={styles.headerTagRow}>
          <span className={styles.headerMetaLabel}>Tags</span>
          <div className={styles.headerTags}>
            {(header.tags ?? []).map((t) => (
              <Chip key={t}>
                {t}
                <button
                  type="button"
                  className={styles.tagRemove}
                  aria-label={`Remove tag ${t}`}
                  onClick={(e) => e.preventDefault()}
                >
                  ×
                </button>
              </Chip>
            ))}
            {header.tagsOverflow > 0 ? <Chip>+{header.tagsOverflow}</Chip> : null}
            <button type="button" className={styles.tagAdd} aria-label="Add tag">
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M10 4L6 8L10 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M6 4L10 8L6 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
