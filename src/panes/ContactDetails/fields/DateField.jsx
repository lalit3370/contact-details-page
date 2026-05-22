import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import styles from './Field.module.css';

function formatDateDisplay(iso) {
  if (!iso) return null;
  // Avoid `new Date('YYYY-MM-DD')` which parses as UTC midnight and renders
  // the previous day west of UTC. Build a local-time date from components.
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const [, y, mo, d] = m;
  const local = new Date(Number(y), Number(mo) - 1, Number(d));
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(local);
  } catch {
    return iso;
  }
}

export function DateField({ field, value, fieldId, contactId }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');
  const inputRef = useRef(null);
  const qc = useQueryClient();

  useEffect(() => {
    setDraft(value ?? '');
  }, [value]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    if (draft !== (value ?? '')) {
      qc.setQueryData(['contact', contactId], (prev) =>
        prev ? { ...prev, fields: { ...prev.fields, [fieldId]: draft || null } } : prev,
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
        {formatDateDisplay(value) ?? <span className={styles.placeholder}>—</span>}
      </button>
    );
  }

  return (
    <input
      ref={inputRef}
      type="date"
      className={styles.input}
      value={draft ?? ''}
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
