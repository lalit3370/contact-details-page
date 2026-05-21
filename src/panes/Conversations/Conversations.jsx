import { useConversations } from '../../api/queries.js';
import { Thread } from './Thread.jsx';
import { MessageInput } from './MessageInput.jsx';
import { Skeleton } from '../../shared/primitives.jsx';
import styles from './Conversations.module.css';

export function Conversations({ contactId }) {
  const { data, isLoading, isError } = useConversations(contactId);

  return (
    <section className={styles.pane} aria-label="Conversations">
      <header className={styles.head}>
        <h2 className={styles.headTitle}>
          <ConversationsIcon /> Conversations
          <ChevronDownIcon />
        </h2>
      </header>

      <div className={styles.body}>
        {isLoading ? (
          <div className={styles.skeletonStack}>
            <Skeleton height={120} radius={8} />
            <Skeleton height={80} radius={8} />
            <Skeleton height={120} radius={8} />
          </div>
        ) : isError ? (
          <p className={styles.empty}>Couldn’t load conversations.</p>
        ) : (data?.threads ?? []).length === 0 ? (
          <p className={styles.empty}>No conversations yet.</p>
        ) : (
          data.threads.map((thread) => <Thread key={thread.id} thread={thread} />)
        )}
      </div>

      <MessageInput />
    </section>
  );
}

function ConversationsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2 4.5C2 3.67 2.67 3 3.5 3H12.5C13.33 3 14 3.67 14 4.5V10C14 10.83 13.33 11.5 12.5 11.5H7L4 13.5V11.5H3.5C2.67 11.5 2 10.83 2 10V4.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
