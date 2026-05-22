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

function WhatsAppIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#25D366"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 21l1.65-4.95A8 8 0 1 1 8 19.4L3 21z" />
      <path d="M9 9c0 .5 .25 1.5 1 2.5s2 1.75 2.5 2c.5.25 1 .25 1.5 0l.5-.5 1.5 1 -.5 .75c-.5 .5-1.5 .75-2.5 .25 -1.25-.5-2.75-1.5-3.75-2.75 -.5-.75-1-2-.25-2.75z" />
    </svg>
  );
}
