import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import styles from './Field.module.css';
import { Chip } from '@/shared/primitives.jsx';

export function TagsField({ field, value, fieldId, contactId }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const qc = useQueryClient();
  const tags = Array.isArray(value) ? value : [];

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  useEffect(() => {
    if (!editing) return;
    const onDocClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setEditing(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [editing]);

  const writeTags = (next) => {
    qc.setQueryData(['contact', contactId], (prev) =>
      prev ? { ...prev, fields: { ...prev.fields, [fieldId]: next } } : prev,
    );
  };

  const addDraft = () => {
    const trimmed = draft.trim();
    if (!trimmed || tags.includes(trimmed)) {
      setDraft('');
      return;
    }
    writeTags([...tags, trimmed]);
    setDraft('');
  };

  const removeTag = (t) => writeTags(tags.filter((x) => x !== t));

  if (!editing) {
    return (
      <button
        type="button"
        className={styles.display}
        onClick={() => setEditing(true)}
        aria-label={`Edit ${field.label}`}
      >
        {tags.length > 0 ? (
          <span className={styles.tagsDisplay}>
            {tags.map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </span>
        ) : (
          <span className={styles.placeholder}>—</span>
        )}
      </button>
    );
  }

  return (
    <div className={styles.tagsEdit} ref={containerRef}>
      {tags.map((t) => (
        <Chip key={t} onClick={(e) => e.stopPropagation()}>
          {t}
          <button
            type="button"
            className={styles.chipRemove}
            onClick={(e) => {
              e.stopPropagation();
              removeTag(t);
            }}
            aria-label={`Remove tag ${t}`}
          >
            ×
          </button>
        </Chip>
      ))}
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Add tag..."
        aria-label="Add tag"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addDraft();
          } else if (e.key === 'Escape') {
            setEditing(false);
          } else if (e.key === 'Backspace' && !draft && tags.length > 0) {
            removeTag(tags[tags.length - 1]);
          }
        }}
        onBlur={addDraft}
      />
    </div>
  );
}
