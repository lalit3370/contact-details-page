import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import styles from './Field.module.css';

function formatDateDisplay(iso) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(iso));
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
