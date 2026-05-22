import { useRef } from 'react';
import { useConversations, useContact } from '../../api/queries.js';
import { Thread } from './Thread.jsx';
import { ChatMessage } from './ChatMessage.jsx';
import { MessageInput } from './MessageInput.jsx';
import { Skeleton } from '../../shared/primitives.jsx';
import { TypingIndicator } from './TypingIndicator.jsx';

import styles from './Conversations.module.css';

function buildAvatarResolver(contact) {
  const displayName = (contact?.header?.displayName ?? '').trim();
  const avatarUrl = contact?.header?.avatarUrl ?? null;
  if (!displayName || !avatarUrl) return () => null;
  const lowerFull = displayName.toLowerCase();
  const firstToken = lowerFull.split(/\s+/)[0];
  return (senderName) => {
    if (!senderName) return null;
    const s = senderName.trim().toLowerCase();
    // Exact-match the full display name, or the first-name token alone.
    // Avoids substring false positives like "Tom" matching "Thompson".
    return s === lowerFull || s === firstToken ? avatarUrl : null;
  };
}

export function Conversations({ contactId }) {
  const { data, isLoading, isError } = useConversations(contactId);
  const { data: contact } = useContact(contactId);
  const avatarFor = buildAvatarResolver(contact);
  const typingName = data?.typing?.[0]?.name ?? null;
  const items = data?.items ?? [];
  const composerRef = useRef(null);
  const focusComposer = () => composerRef.current?.focus();

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
        ) : items.length === 0 ? (
          <p className={styles.empty}>No conversations yet.</p>
        ) : (
          items.map((item) => {
            if (item.kind === 'thread')
              return (
                <Thread key={item.id} thread={item} avatarFor={avatarFor} onReply={focusComposer} />
              );
            if (item.kind === 'chat')
              return <ChatMessage key={item.id} message={item} avatarFor={avatarFor} />;
            return null;
          })
        )}
      </div>
      {typingName ? <TypingIndicator name={typingName} /> : null}
      <MessageInput ref={composerRef} contactId={contactId} />
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
