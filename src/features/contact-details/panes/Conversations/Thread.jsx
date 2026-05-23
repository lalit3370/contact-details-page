import { Message } from './Message.jsx';
import { ExpandIcon } from '@/shared/Icons.jsx';
import styles from './Conversations.module.css';

export function Thread({ thread, avatarFor, onReply }) {
  return (
    <section className={styles.thread} aria-label={thread.subject || 'Thread'}>
      <header className={styles.threadHead}>
        <span className={styles.threadSubject} title={thread.subject}>
          {thread.subject}
        </span>
        <button type="button" className={styles.threadExpand} aria-label="Expand thread">
          <ExpandIcon />
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
