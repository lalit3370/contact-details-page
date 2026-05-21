import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import styles from './Field.module.css';

const COUNTRY_FLAG = {
  US: '🇺🇸',
  CA: '🇨🇦',
  GB: '🇬🇧',
  IN: '🇮🇳',
};

export function PhoneField({ field, value, fieldId, contactId, contact }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');
  const inputRef = useRef(null);
  const qc = useQueryClient();
  const country = contact?.fields?.phoneCountry ?? 'US';
  const flag = COUNTRY_FLAG[country] ?? '🌐';

  useEffect(() => {
    setDraft(value ?? '');
  }, [value]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    if (draft !== (value ?? '')) {
      qc.setQueryData(['contact', contactId], (prev) =>
        prev ? { ...prev, fields: { ...prev.fields, [fieldId]: draft } } : prev,
      );
    }
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value ?? '');
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className={styles.phoneRow}>
        <button
          type="button"
          className={styles.display}
          onClick={() => setEditing(true)}
          aria-label={`Edit ${field.label}`}
        >
          <span className={styles.phoneFlag} aria-hidden="true">
            {flag}
          </span>
          {value || <span className={styles.placeholder}>—</span>}
        </button>
        <span className={styles.phoneActions}>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label="Edit phone"
            onClick={() => setEditing(true)}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M11.5 1.5L14.5 4.5L5.5 13.5H2.5V10.5L11.5 1.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <a
            href={`tel:${value ?? ''}`}
            className={`${styles.iconBtn} ${styles.callBtn}`}
            aria-label="Call"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 3.5C3 2.67 3.67 2 4.5 2H5.5L6.5 4.5L5 5.5C5.5 7 7 8.5 8.5 9L9.5 7.5L12 8.5V9.5C12 10.33 11.33 11 10.5 11C6.36 11 3 7.64 3 3.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </span>
      </div>
    );
  }

  return (
    <input
      ref={inputRef}
      type="tel"
      className={styles.input}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          commit();
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          cancel();
        }
      }}
      aria-label={field.label}
    />
  );
}
