import { WhatsAppIcon } from '@/shared/Icons.jsx';
import styles from './Conversations.module.css';

export function TypingIndicator({ name }) {
  if (!name) return null;
  return (
    <div className={styles.typing} role="status" aria-live="polite">
      <WhatsAppIcon />
      <span>{name} is typing</span>
      <span className={styles.typingDots} aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    </div>
  );
}
