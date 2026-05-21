import { Message } from './Message.jsx';
import { TypingIndicator } from './TypingIndicator.jsx';
import styles from './Conversations.module.css';

export function Thread({ thread }) {
  return (
    <article className={styles.thread}>
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

      <div className={styles.threadMessages}>
        {(thread.messages ?? []).map((m, i) => (
          <Message
            key={m.id}
            message={m}
            isReply={
              i > 0 &&
              (thread.messages[i - 1].sender?.name !== m.sender?.name || m.timestamp?.includes(':'))
            }
          />
        ))}
      </div>

      {(thread.typing ?? []).length > 0 ? <TypingIndicator names={thread.typing} /> : null}
    </article>
  );
}
