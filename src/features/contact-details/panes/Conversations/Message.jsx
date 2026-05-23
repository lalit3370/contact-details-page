import { Avatar } from '@/shared/primitives.jsx';
import { StarIcon, ReplyArrowIcon, KebabIcon } from '@/shared/Icons.jsx';
import { OrderTrackingCard } from './OrderTrackingCard.jsx';
import styles from './Conversations.module.css';

export function Message({ message, avatarFor, onReply }) {
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
          <button type="button" className={styles.replyButton} onClick={onReply}>
            <ReplyArrowIcon /> Reply
          </button>
        ) : null}
      </div>
    </div>
  );
}
