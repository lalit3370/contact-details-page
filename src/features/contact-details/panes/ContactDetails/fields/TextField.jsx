import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import styles from './Field.module.css';

const TYPE_TO_INPUT = {
  string: 'text',
  email: 'email',
  url: 'url',
  textarea: 'text',
};

export function TextField({ field, value, fieldId, contactId }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');
  const inputRef = useRef(null);
  const qc = useQueryClient();
  const multiline = field.multiline || field.type === 'textarea';
  const inputType = TYPE_TO_INPUT[field.type] ?? 'text';

  useEffect(() => {
    setDraft(value ?? '');
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current.select) inputRef.current.select();
    }
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

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    } else if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      commit();
    }
  };

  if (!editing) {
    const isUrl = field.type === 'url' && value;
    return (
      <button
        type="button"
        className={styles.display}
        onClick={() => setEditing(true)}
        aria-label={`Edit ${field.label}`}
      >
        {value ? (
          isUrl ? (
            <a
              className={styles.link}
              href={value}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              {value}
            </a>
          ) : (
            value
          )
        ) : (
          <span className={styles.placeholder}>—</span>
        )}
      </button>
    );
  }

  if (multiline) {
    return (
      <textarea
        ref={inputRef}
        className={styles.textarea}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={onKeyDown}
        aria-label={field.label}
      />
    );
  }

  return (
    <input
      ref={inputRef}
      type={inputType}
      className={styles.input}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={onKeyDown}
      aria-label={field.label}
    />
  );
}
