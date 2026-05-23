import { useRef } from 'react';
import { useConversations, useContact } from '../../api/queries.js';
import { Thread } from './Thread.jsx';
import { ChatMessage } from './ChatMessage.jsx';
import { MessageInput } from './MessageInput.jsx';
import { ConversationsSkeleton } from '../skeletons/ConversationsSkeleton.jsx';
import { PaneError } from '@/shared/PaneError.jsx';
import { TypingIndicator } from './TypingIndicator.jsx';
import { buildAvatarResolver } from '@/shared/utils.js';
import { ConversationsIcon, ChevronDownIcon } from '@/shared/Icons.jsx';

import styles from './Conversations.module.css';

export function Conversations({ contactId }) {
  const { data, isLoading, isError, refetch } = useConversations(contactId);
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
          <ConversationsSkeleton />
        ) : isError ? (
          <PaneError message="Couldn’t load conversations." onRetry={refetch} />
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
