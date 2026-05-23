import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { qk } from '../../../api/queryKeys.js';
import styles from './Field.module.css';

export function ChoiceField({ field, value, fieldId, contactId }) {
  const multiple = field.type === 'multi-select';
  const [editing, setEditing] = useState(false);
  const containerRef = useRef(null);
  const qc = useQueryClient();
  const options = field.options ?? [];
  const selectedSet = multiple ? new Set(value ?? []) : null;

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

  const setValue = (next) => {
    qc.setQueryData(qk.contact(contactId), (prev) =>
      prev ? { ...prev, fields: { ...prev.fields, [fieldId]: next } } : prev,
    );
  };

  const selectRadio = (opt) => {
    setValue(opt);
    setEditing(false);
  };

  const toggleMulti = (opt) => {
    const next = new Set(selectedSet);
    if (next.has(opt)) next.delete(opt);
    else next.add(opt);
    setValue(Array.from(next));
  };

  if (!editing) {
    let display;
    if (multiple) {
      const list = value ?? [];
      display = list.length > 0 ? list.join(', ') : null;
    } else {
      display = value || null;
    }
    return (
      <button
        type="button"
        className={styles.display}
        onClick={() => setEditing(true)}
        aria-label={`Edit ${field.label}`}
        aria-haspopup="listbox"
      >
        {display ?? <span className={styles.placeholder}>—</span>}
      </button>
    );
  }

  return (
    <div
      ref={containerRef}
      className={multiple ? styles.checkboxGroup : styles.radioGroup}
      role={multiple ? 'group' : 'radiogroup'}
      aria-label={field.label}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setEditing(false);
      }}
    >
      {options.map((opt) => (
        <label key={opt} className={styles.radioOption}>
          <input
            type={multiple ? 'checkbox' : 'radio'}
            name={fieldId}
            checked={multiple ? selectedSet.has(opt) : value === opt}
            onChange={() => (multiple ? toggleMulti(opt) : selectRadio(opt))}
          />
          {opt}
        </label>
      ))}
    </div>
  );
}
