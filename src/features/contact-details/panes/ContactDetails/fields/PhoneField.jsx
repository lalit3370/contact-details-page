import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { qk } from '../../../api/queryKeys.js';
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
      qc.setQueryData(qk.contact(contactId), (prev) =>
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
