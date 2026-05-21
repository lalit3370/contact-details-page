import { Avatar } from '../../shared/primitives.jsx';
import styles from './Conversations.module.css';

export function TypingIndicator({ names }) {
  const label = names?.length === 1 ? `${names[0].name} is typing` : 'Multiple people typing';
  return (
    <div className={styles.typing} role="status" aria-live="polite">
      <Avatar name={names?.[0]?.name} size={16} />
      <span>{label}</span>
      <span className={styles.typingDots} aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    </div>
  );
}
