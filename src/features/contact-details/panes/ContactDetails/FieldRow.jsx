import { fieldRegistry } from './fieldRegistry.js';
import styles from './fields/Field.module.css';

export function FieldRow({ field, value, fieldId, contactId, contact }) {
  const Component = fieldRegistry[field.type];
  const rowClass = `${styles.row} ${field.width === 'half' ? styles.rowHalf : ''}`;

  if (!Component) {
    if (import.meta.env.DEV) {
      console.warn(`[FieldRow] unknown field type "${field.type}" for "${fieldId}"`);
    }
    return (
      <div className={rowClass}>
        <span className={styles.label}>{field.label}</span>
        <span className={styles.fallback}>{value == null ? '—' : String(value)}</span>
      </div>
    );
  }

  return (
    <div className={rowClass}>
      <span className={styles.label}>{field.label}</span>
      <Component
        field={field}
        value={value}
        fieldId={fieldId}
        contactId={contactId}
        contact={contact}
      />
    </div>
  );
}
