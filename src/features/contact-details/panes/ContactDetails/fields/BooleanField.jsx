import { useQueryClient } from '@tanstack/react-query';
import { qk } from '../../../api/queryKeys.js';
import styles from './Field.module.css';

export function BooleanField({ field, value, fieldId, contactId }) {
  const qc = useQueryClient();
  const on = Boolean(value);

  const toggle = () => {
    qc.setQueryData(qk.contact(contactId), (prev) =>
      prev ? { ...prev, fields: { ...prev.fields, [fieldId]: !on } } : prev,
    );
  };

  return (
    <button
      type="button"
      className={styles.boolToggle}
      data-on={String(on)}
      onClick={toggle}
      aria-pressed={on}
      aria-label={field.label}
    >
      {on ? 'Yes' : 'No'}
    </button>
  );
}
