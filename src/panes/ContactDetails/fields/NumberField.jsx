import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import styles from './Field.module.css';

export function NumberField({ field, value, fieldId, contactId }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');
  const inputRef = useRef(null);
  const qc = useQueryClient();
  const isCurrency = field.type === 'currency';

  useEffect(() => {
    setDraft(value ?? '');
  }, [value]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const formatted = (() => {
    if (value === null || value === undefined || value === '') return null;
    if (isCurrency) {
      try {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: field.currency ?? 'USD',
          maximumFractionDigits: 0,
        }).format(Number(value));
      } catch {
        return String(value);
      }
    }
    return String(value);
  })();

  const commit = () => {
    const parsed = draft === '' ? null : Number(draft);
    if (parsed !== value) {
      qc.setQueryData(['contact', contactId], (prev) =>
        prev ? { ...prev, fields: { ...prev.fields, [fieldId]: parsed } } : prev,
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
        {formatted ?? <span className={styles.placeholder}>—</span>}
      </button>
    );
  }

  return (
    <input
      ref={inputRef}
      type="number"
      inputMode="decimal"
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
