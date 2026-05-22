import { Avatar } from '../../shared/primitives.jsx';
import styles from './Conversations.module.css';

export function ChatMessage({ message, avatarFor }) {
  const avatarUrl = avatarFor?.(message.sender?.name) ?? null;
  return (
    <div className={styles.chatRow}>
      <Avatar url={avatarUrl} name={message.sender?.name} size={20} />
      <div className={styles.chatBubble}>
        <div className={styles.chatSender}>{message.sender?.name}</div>
        <div className={styles.chatBody}>{message.body}</div>
        {message.timestamp ? <div className={styles.chatTime}>{message.timestamp}</div> : null}
      </div>
    </div>
  );
}
