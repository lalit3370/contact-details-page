import { Avatar } from '../../shared/primitives.jsx';
import { OrderTrackingCard } from './OrderTrackingCard.jsx';
import styles from './Conversations.module.css';

export function Message({ message, avatarFor }) {
  const avatarUrl = avatarFor?.(message.sender?.name) ?? null;
  return (
    <div className={styles.message}>
      <header className={styles.messageHead}>
        <Avatar url={avatarUrl} name={message.sender?.name} size={28} />
        <span className={styles.messageSender}>
          {message.sender?.name}
          {message.sender?.to ? (
            <span className={styles.messageTo}> To: {message.sender.to}</span>
          ) : null}
        </span>
        <span className={styles.messageMeta}>
          <span>{message.timestamp}</span>
          {message.starred ? <StarIcon /> : null}
          <ReplyArrowIcon />
          <KebabIcon />
        </span>
      </header>

      <div className={styles.messageBody}>
        <div className={styles.messageText}>
          {message.body.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
        {(message.attachments ?? []).map((att, i) =>
          att.type === 'orderTracking' ? <OrderTrackingCard key={i} attachment={att} /> : null,
        )}
        {(message.actions ?? []).includes('reply') ? (
          <button type="button" className={styles.replyButton}>
            <ReplyArrowIcon /> Reply
          </button>
        ) : null}
      </div>
    </div>
  );
}

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="#facc15" aria-hidden="true">
      <path
        d="M8 1L10 6L15 6L11 9L13 14L8 11L3 14L5 9L1 6L6 6L8 1Z"
        stroke="#facc15"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ReplyArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M7 4L3 8L7 12M3 8H10C12 8 13 9 13 11V13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function KebabIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <circle cx="8" cy="3" r="1.2" />
      <circle cx="8" cy="8" r="1.2" />
      <circle cx="8" cy="13" r="1.2" />
    </svg>
  );
}
