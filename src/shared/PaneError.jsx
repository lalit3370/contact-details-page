import styles from './PaneError.module.css';

// Shared error block for a pane whose data fetch failed.
// Renders an alert message with a Try again button wired to `onRetry`.
// Callers position it inside their own section/body wrapper.
export function PaneError({ message, onRetry, retryLabel = 'Try again' }) {
  return (
    <div className={styles.root} role="alert">
      <p className={styles.message}>{message}</p>
      <button type="button" className={styles.retryBtn} onClick={onRetry}>
        {retryLabel}
      </button>
    </div>
  );
}
