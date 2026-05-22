import { Message } from './Message.jsx';
import styles from './Conversations.module.css';

export function Thread({ thread, avatarFor, onReply }) {
  return (
    <section className={styles.thread} aria-label={thread.subject || 'Thread'}>
      <header className={styles.threadHead}>
        <span className={styles.threadSubject} title={thread.subject}>
          {thread.subject}
        </span>
        <button type="button" className={styles.threadExpand} aria-label="Expand thread">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M3 9V13H7M13 7V3H9M3 13L7 9M13 3L9 7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </header>
      {thread.messageCount ? (
        <div className={styles.threadCount} aria-hidden="true">
          <span>{thread.messageCount}</span>
        </div>
      ) : null}
      <Message message={thread.message} avatarFor={avatarFor} onReply={onReply} />
    </section>
  );
}
